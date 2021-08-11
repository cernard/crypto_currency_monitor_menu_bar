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

  const markets = useContext(MarketsContext);

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
            <Input ref={inputRef} onPressEnter={save} onBlur={save} />
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
            <Input ref={inputRef} onPressEnter={save} onBlur={save} />
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
            initialValue="auto"
          >
            <Select ref={inputRef} onBlur={save} showSearch>
              <Option value="auto" key="auto">
                auto
              </Option>
              <Option value="a" key="a">
                a
              </Option>
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
  key: React.Key;
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

const EditableRow: React.FC<EditableRowProps> = ({ index, ...props }) => {
  const [form] = Form.useForm();
  return (
    <Form form={form} component={false}>
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

    // WARNING: state.count必须比dataSource中最大的count要大
    this.state = {
      dataSource: [
        {
          key: 0,
          base: 'Edward King 0',
          quote: '32',
          exchange: 'auto',
          index: 0,
        },
      ],
      count: 1,
      markets: [],
      isMarketsLoading: false,
    };
  }

  handleDelete = (key: React.Key) => {
    const dataSource = [...this.state.dataSource];
    this.setState({
      dataSource: dataSource.filter((item) => item.key !== key),
    });
  };

  handleAdd = () => {
    const { count, dataSource } = this.state;
    const newData: DataType = {
      key: count,
      base: 'BTC',
      quote: 'USDT',
      exchange: 'auto',
      index: count,
    };
    this.setState({
      dataSource: [...dataSource, newData],
      count: count + 1,
    });
    ipcRenderer.send('notifyFromConfig', [...dataSource, newData]);
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
    console.log(newData);
  };

  onSortEnd = ({ oldIndex, newIndex }) => {
    const { dataSource } = this.state;
    if (oldIndex !== newIndex) {
      let newData = arrayMove([].concat(dataSource), oldIndex, newIndex).filter(
        (el) => !!el
      );
      let _count = 0;
      newData = newData.map((d) => {
        d.index = _count++;
        return d;
      });
      this.setState({ dataSource: newData });
      ipcRenderer.send('notifyFromConfig', newData);
      console.log(newData);
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
