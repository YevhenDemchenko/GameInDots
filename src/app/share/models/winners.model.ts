export class  WinnersModel {
  constructor(props?: Partial<WinnersModel>) {
    if (props) {
      this.id = props.id;
      this.winner = props.winner || '';
      this.date = props.date || '';
    } else {
      props.default();
    }
  }
  id: number;
  winner: string;
  date: string;

  default() {
    this.id = 0;
    this.winner = '';
    this.date = '';
  }
}
