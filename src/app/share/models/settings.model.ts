export class SettingsModel {
  constructor(name: string, delay: number, field: number) {
    this.name = name;
    this.delay = delay;
    this.field = field;
  }
  name: string;
  delay: number;
  field: number;
}
