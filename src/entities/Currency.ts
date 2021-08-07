export default interface SimpleCurrencyEntity {
  base: string;
  quote: string;
  price: number;
  icon?: string;
  trend?: string; // up, down and other else.
}
