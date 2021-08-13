import React, { useContext, useState, useEffect, useRef } from 'react';
import { Table, Input, Select, Popconfirm, Form } from 'antd';
import { MenuOutlined } from '@ant-design/icons';
import { FormInstance } from 'antd/lib/form';
import {
  SortableContainer,
  SortableElement,
  SortableHandle,
} from 'react-sortable-hoc';
import arrayMove from 'array-move';
import { ipcRenderer } from 'electron';
import ElectronStore from 'electron-store';
import { Dictionary, Exchange as CCXTExchange, Market } from 'ccxt';
import HttpsProxyAgent from 'https-proxy-agent';
import { isArray, isEmpty } from 'lodash';
import { useControllableValue, useMount, useRequest } from 'ahooks';
import StoreKeys from '../../entities/StoreKeys';

const ccxt = require('ccxt');

const store = new ElectronStore();

let agent: any;
if (process.env.NODE_ENV !== 'production') {
  // TODO 发布时删除此代码
  agent = HttpsProxyAgent('http://127.0.0.1:7890');
}

const EditableContext = React.createContext<FormInstance<any> | null>(null);
const MarketsContext = React.createContext<BaseAndQuotes[]>([]);
interface Item {
  key: string;
  base: string;
  quote: string;
  exchange: string;
}

interface EditableRowProps {
  index: number;
}
interface EditableCellProps {
  title: React.ReactNode;
  editable: boolean;
  children: React.ReactNode;
  dataIndex: keyof Item;
  record: Item;
  handleSave: (record: Item) => void;
}

const { Option } = Select;

function getMarkets(exchangeId: string) {
  console.log('getMarkets: ', exchangeId);

  let exchange: CCXTExchange;
  if (process.env.NODE_ENV !== 'production') {
    exchange = new ccxt[exchangeId]({ agent });
  } else {
    exchange = new ccxt[exchangeId]();
  }

  return exchange.loadMarkets();
}

const EditableCell: React.FC<EditableCellProps> = ({
  editable,
  children,
  dataIndex,
  record,
  handleSave,
  ...restProps
}) => {
  const [editing, setEditing] = useState(false);
  const inputRef = useRef<Input>(null);
  const form = useContext(EditableContext)!;

  // console.log(dataIndex, baseOptions, quoteOptions);

  useEffect(() => {
    if (editing) {
      inputRef.current!.focus();
    }
  }, [editing]);

  const toggleEdit = () => {
    setEditing(!editing);
    form.setFieldsValue({ [dataIndex]: record[dataIndex] });
  };

  const save = async () => {
    try {
      const values = await form.validateFields();
      toggleEdit();
      handleSave({ ...record, ...values });
    } catch (errInfo) {
      console.log('Save failed:', errInfo);
    }
  };

  let childNode = children;
  let editableChild = null;
  if (editable) {
    switch (dataIndex) {
      case 'base':
        editableChild = (
          <Form.Item
            style={{ margin: 0 }}
            name={dataIndex}
            rules={[
              {
                required: true,
                message: `Base is required.`,
              },
            ]}
          >
            <Select ref={inputRef} onBlur={save} showSearch>
              {/* {baseOptions.map((e) => (
                <Option value={e} key={e}>
                  {e}
                </Option>
              ))} */}
            </Select>
            {/* <Input ref={inputRef} onPressEnter={save} onBlur={save} /> */}
          </Form.Item>
        );
        break;
      case 'quote':
        editableChild = (
          <Form.Item
            style={{ margin: 0 }}
            name={dataIndex}
            rules={[
              {
                required: true,
                message: `Quote is required.`,
              },
            ]}
          >
            <Select ref={inputRef} onBlur={save} showSearch>
              {/* {quoteOptions.map((e) => (
                <Option value={e} key={e}>
                  {e}
                </Option>
              ))} */}
            </Select>
            {/* <Input ref={inputRef} onPressEnter={save} onBlur={save} /> */}
          </Form.Item>
        );
        break;
      case 'exchange':
        editableChild = (
          <Form.Item
            style={{ margin: 0 }}
            name={dataIndex}
            rules={[
              {
                required: true,
                message: `Exchange is required.`,
              },
            ]}
            initialValue="binance"
          >
            <Select ref={inputRef} onBlur={save} showSearch>
              {ccxt.exchanges.map((e) => (
                <Option value={e} key={e}>
                  {e}
                </Option>
              ))}
            </Select>
          </Form.Item>
        );
        break;
      default:
        editableChild = <>Unsupport field</>;
    }
    childNode = editing ? (
      editableChild
    ) : (
      <div style={{ paddingRight: 24 }} onClick={toggleEdit}>
        {children}
      </div>
    );
  }

  return <td {...restProps}>{childNode}</td>;
};

type EditableTableProps = Parameters<typeof Table>[0];

export interface DataType {
  key: number;
  base: string;
  quote: string;
  exchange: string;
  index: number;
}

interface EditableTableState {
  dataSource: DataType[];
  count: number;
  markets: BaseAndQuotes[];
  isMarketsLoading: boolean;
}

type ColumnTypes = Exclude<EditableTableProps['columns'], undefined>;
const DragHandle = SortableHandle(() => (
  <MenuOutlined style={{ cursor: 'grab', color: '#999' }} />
));
// const SortableItem = SortableElement((props) => <EditableRow {...props} />);
const SortableItem = SortableElement((props) => <EditableRow {...props} />);
const TBodySortableContainer = SortableContainer((props) => (
  <tbody {...props} />
));

// TODO 当表格行渲染完毕，更新单元格组件数据
const EditableRow: React.FC<EditableRowProps> = ({ index, ...props }) => {
  const [form] = Form.useForm();

  const { loading, run } = useRequest(getMarkets, {
    manual: true,
    throwOnError: true,
    onSuccess: (result: Dictionary<Market>, params) => {
      Object.values(result).forEach((value) => {
        console.log(value);
      });
    },
    onError: (error, params) => {
      console.error(error.message, params);
    },
  });

  const [baseOptions, setBaseOptions] = useState<string[]>(['a', 'b']);
  const [quoteOptions, setQuoteOptions] = useState<string[]>([
    'c',
    'd',
    'e',
    'f',
  ]);
  const [exchangeId, setExchangeId] = useState('');

  useMount(() => {
    if (props && props.children) {
      const filted = props.children.filter(c => c.key === 'exchange');
      if (filted.length !== 0) {
        // 得到表行的默认交易所id
        const eid = filted[0].props.record.exchange;
        setExchangeId(eid);
      }
    }
  });

  useEffect(() => {
    if (exchangeId) {
      run(exchangeId);
    }
  }, [exchangeId]);

  return (
    <Form form={form} component={false} onFieldsChange={(a, b) => {console.log(a, b)}}>
      <EditableContext.Provider value={form}>
        <tr {...props} />
      </EditableContext.Provider>
    </Form>
  );
};
export interface Exchange {
  name: string;
  delay: number;
}
export interface QuoteAndExchages {
  quote: string;
  exchanges: Exchange[];
  symbol: string;
}
export interface BaseAndQuotes {
  base: string;
  quotes: QuoteAndExchages[];
}
class EditableTable extends React.Component<
  EditableTableProps,
  EditableTableState
> {
  columns: (ColumnTypes[number] & { editable?: boolean; dataIndex: string })[];

  constructor(props: EditableTableProps) {
    super(props);

    this.columns = [
      {
        title: 'Sort',
        dataIndex: 'sort',
        width: 50,
        className: 'drag-visible',
        render: () => <DragHandle />,
      },
      {
        title: 'Base',
        dataIndex: 'base',
        editable: true,
        width: 50,
      },
      {
        title: 'Quote',
        dataIndex: 'quote',
        editable: true,
        width: 50,
      },
      {
        title: 'Exchange',
        dataIndex: 'exchange',
        editable: true,
        width: 70,
      },
      {
        title: 'Operation',
        dataIndex: 'operation',
        render: (_, record: { key: React.Key }) =>
          this.state.dataSource.length >= 1 ? (
            <Popconfirm
              title="Sure to delete?"
              onConfirm={() => this.handleDelete(record.key)}
            >
              <a>Delete</a>
            </Popconfirm>
          ) : null,
        width: 70,
      },
    ];

    const data: unknown = store.get(StoreKeys.MonitorListConifg);
    let savedData: DataType[] = [];
    if (data && typeof data === 'object') {
      savedData = data;
    }

    // WARNING: state.count必须比dataSource中最大的count要大
    let count = 0;
    if (savedData.length !== 0) {
      count =
        savedData.sort((a: DataType, b: DataType) => b.key - a.key)[0].key + 1;
    }
    this.state = {
      dataSource: savedData,
      count,
      markets: [],
      isMarketsLoading: false,
    };
  }

  handleDelete = (key: React.Key) => {
    let { dataSource } = this.state;
    dataSource = dataSource.filter((item) => item.key !== key);
    this.setState({
      dataSource,
    });
    store.set(StoreKeys.MonitorListConifg, dataSource);
  };

  handleAdd = () => {
    const { count, dataSource } = this.state;
    const newData: DataType = {
      key: count,
      base: 'BTC',
      quote: 'USDT',
      exchange: 'binance',
      index: count,
    };
    this.setState({
      dataSource: [...dataSource, newData],
      count: count + 1,
    });
    ipcRenderer.send('notifyFromConfig', [...dataSource, newData]);
    store.set(StoreKeys.MonitorListConifg, [...dataSource, newData]);
  };

  handleSave = (row: DataType) => {
    const newData = [...this.state.dataSource];
    const index = newData.findIndex((item) => row.key === item.key);
    const item = newData[index];
    newData.splice(index, 1, {
      ...item,
      ...row,
    });
    this.setState({ dataSource: newData });
    ipcRenderer.send('notifyFromConfig', newData);
    store.set(StoreKeys.MonitorListConifg, newData);
  };

  onSortEnd = ({ oldIndex, newIndex }) => {
    const { dataSource } = this.state;
    if (oldIndex !== newIndex) {
      let newData = arrayMove([].concat(dataSource), oldIndex, newIndex).filter(
        (el) => !!el
      );
      let _count = 0;
      newData = newData.map((d) => {
        d.key = _count;
        d.index = _count;
        _count += 1;
        return d;
      });
      this.setState({ dataSource: newData });
      ipcRenderer.send('notifyFromConfig', newData);
      store.set(StoreKeys.MonitorListConifg, newData);
    }
  };

  DraggableContainer = (props) => (
    <TBodySortableContainer
      useDragHandle
      disableAutoscroll
      helperClass="row-dragging"
      onSortEnd={this.onSortEnd}
      {...props}
    />
  );

  DraggableBodyRow = ({ className, style, ...restProps }) => {
    const { dataSource } = this.state;
    // function findIndex base on Table rowKey props and should always be a right array index
    const index = dataSource.findIndex(
      (x) => x.index === restProps['data-row-key']
    );
    return <SortableItem index={index} {...restProps} />;
  };

  render() {
    const { dataSource, markets, isMarketsLoading } = this.state;
    const components = {
      body: {
        wrapper: this.DraggableContainer,
        row: this.DraggableBodyRow,
        // row: EditableRow,
        cell: EditableCell,
      },
    };
    const columns = this.columns.map((col) => {
      if (!col.editable) {
        return col;
      }
      return {
        ...col,
        onCell: (record: DataType) => ({
          record,
          editable: col.editable,
          dataIndex: col.dataIndex,
          title: col.title,
          handleSave: this.handleSave,
        }),
      };
    });
    return (
      <MarketsContext.Provider value={markets}>
        <div className="w-10/12">
          {/* <button
            type="button"
            className="btn btn-primary"
            style={{ margin: 10, float: 'right' }}
            onClick={this.handleAdd}
          >
            Add one
          </button> */}
          <Table
            sticky
            components={components}
            bordered
            pagination={false}
            dataSource={dataSource}
            columns={columns as ColumnTypes}
            loading={isMarketsLoading}
            size="small"
          />
          <div
            className="absolute right-10 bottom-10 rounded-full h-16 w-16 flex justify-center items-center text-white cursor-pointer shadow active:shadow-xl transition-all bg-gradient-to-tr from-green-400 to-blue-500 hover:from-red-200 hover:to-yellow-500 "
            onClick={this.handleAdd}
          >
            Add
          </div>
        </div>
      </MarketsContext.Provider>
    );
  }
}

export default EditableTable;
