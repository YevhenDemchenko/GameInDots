export class SquareModel {
  constructor(props?: Partial<SquareModel>) {
    if (props) {
      this.id = props.id;
      this.active = props.active || false;
      this.loss = props.loss || false;
      this.win = props.win || false;
    } else {
      props.default();
    }
  }

  id: number;
  active: boolean;
  loss: boolean;
  win: boolean;

  default() {
    this.id = 0;
    this.active = false;
    this.loss = false;
    this.win = false;
  }
}
