export default interface MonitorCurrencyDTO {
  base: string;
  quote: string;
  price: number;
  icon?: string;
  trend?: string; // up, down and other else.
  trend24H?: number[];
}
