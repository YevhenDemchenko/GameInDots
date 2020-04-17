import {Component, OnInit} from '@angular/core';
import {from, Observable, of, Subject, Subscription} from 'rxjs';
import {HttpService} from '../share/services/http.service';
import {SettingsModel} from '../share/models/settings.model';
import {SquareModel} from '../share/models/square.model';
import {concatMap, delay, takeUntil} from 'rxjs/operators';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent implements OnInit {

  constructor(private httpService: HttpService) { }

  private destroyStream$ = new Subject<void>();

  observableSettings: Observable<SettingsModel>;
  settingsSubscriptions: Subscription = new Subscription();
  settingsArray: SettingsModel[] = [];
  selectedMode: SettingsModel;
  userName = '';
  winner = '';
  contentSize: number;
  playAgain = false;
  pointsComputer = 0;
  pointsUser = 0;
  pointer = 0;

  squaresArray: SquareModel[] = [];

  isLoad: boolean;

  ngOnInit(): void {
    this.isLoad = false;
    this.loadSettings();
  }

  loadSettings() {
    this.observableSettings = this.httpService.getSettings();
    this.settingsSubscriptions = this.observableSettings.subscribe({
      next: (data: SettingsModel) => {
        Object.keys(data).forEach( (item) => {
            this.settingsArray.push(new SettingsModel(item, data[item].delay, data[item].field));
        });
        console.log(this.settingsArray);
        this.isLoad = true;
      },
      error: error => {
        this.isLoad = false;
        console.error('There was an error!', error);
      }
    });
  }

  initGameField() {
    this.playAgain = false;
    this.squaresArray = [];
    this.pointsComputer = 0;
    this.pointsUser = 0;
    for (let i = 0; i < (this.selectedMode.field * this.selectedMode.field); i++) {
      this.squaresArray.push(new SquareModel({id: i}));
    }
    switch (this.selectedMode.field) {
      case 5:
        this.contentSize = 300;
        break;
      case 10:
        this.contentSize = 560;
        break;
      case 15:
        this.contentSize = 810;
        break;
    }
  }

  startPlay() {
    this.initGameField();
    this.destroyStream$.next();

    const randomSquaresArr: number[] = this.randomSquares();
    const settingDelay = this.selectedMode.delay;

    // start random activation
    from(randomSquaresArr)
      .pipe(
        concatMap(x => of(x)
          .pipe(
            delay(settingDelay)
          )
        ),
        takeUntil(this.destroyStream$)
      )
      .subscribe((id) => {
        this.toggleActiveSquares(id);

        setTimeout(() => {
          this.toggleActiveSquares(id);

          this.userDontClickOnSquare(id);

          this.endGame();
        }, settingDelay);
      });
  }

  private randomSquares(): number[] {
    const min = 0;
    const maxNumberSquares: number = this.squaresArray.length;

    const exitIdNumbers: number[] = [];
    const result: number[] = [];

    for (let i = min; i < maxNumberSquares; i++) {
      exitIdNumbers.push(i);
    }

    for (let i = 0; i < maxNumberSquares; i++) {
      const range = Math.floor(Math.random() * (exitIdNumbers.length - min)) + min;
      const firstElement = exitIdNumbers.splice(range, 1)[0];
      result.push(firstElement);
    }

    return result;
  }

  private toggleActiveSquares(id) {
    this.squaresArray.find((element) => element.id === id && (element.active = !element.active));
  }

  private userDontClickOnSquare(squareId: number) {
    this.squaresArray
      .find((element) => this.checkStatusSquare(element, {id: squareId}) && (element.loss = true));
    this.pointer++;
  }

  userClickOnSquare(square: SquareModel) {
    if (square.active) {
      this.squaresArray
        .find((element) => this.checkStatusSquare(element, square) && (element.win = true));
      // this.pointsUser++;
    }
  }

  private checkStatusSquare = ({id, loss, win}, square) => id === square.id && !loss && !win;


  private endGame() {
    let pointsComputer = 0;
    let pointsPlayer = 0;

    this.squaresArray.forEach((item: SquareModel) => {
      item.loss && (pointsComputer += 1);
      item.win && (pointsPlayer += 1);
    });

    if (pointsComputer > this.squaresArray.length / 2 || pointsPlayer > this.squaresArray.length / 2) {

      this.playAgain = true;

      console.log(this.pointsUser);
      console.log(this.pointsComputer);


      console.log(pointsComputer);
      console.log(pointsPlayer);
      const name = pointsComputer > pointsPlayer ? 'Computer' : this.userName;
      const date = new Date().toLocaleString();

      // const winner = new WinnerModel({winner: name, date});

      this.showGameResult(name);

      // this.apiService.sentResult(winner);
      this.destroyStream$.next();

    }
  }

  private showGameResult(name) {
    this.winner = name;
    console.log(this.winner);
  }
}
