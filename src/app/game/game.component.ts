import {Component, OnDestroy, OnInit} from '@angular/core';
import {from, Observable, of, Subject, Subscription} from 'rxjs';
import {HttpService} from '../share/services/http.service';
import {SettingsModel} from '../share/models/settings.model';
import {SquareModel} from '../share/models/square.model';
import {concatMap, delay, takeUntil} from 'rxjs/operators';
import {WinnersModel} from '../share/models/winners.model';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent implements OnInit, OnDestroy {

  constructor(private httpService: HttpService) { }

  private stopGameSubject = new Subject<void>();

  observableSettings: Observable<SettingsModel>;
  settingsSubscriptions: Subscription = new Subscription();
  settingsArray: SettingsModel[] = [];
  selectedMode: SettingsModel;
  userName = '';
  winner = '';
  contentSize: number;
  widthSquare: number;
  heightSquare: number;
  playAgain = false;
  isGameInProgress = false;
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
        this.widthSquare = 50;
        this.heightSquare = 50;
        break;
      case 10:
        this.contentSize = 500;
        this.widthSquare = 45;
        this.heightSquare = 45;
        break;
      case 15:
        this.contentSize = 650;
        this.widthSquare = 40;
        this.heightSquare = 40;
        break;
    }
  }

  startPlay() {
    this.isGameInProgress = true;
    this.initGameField();
    this.stopGameSubject.next();

    const randomSquaresArr: number[] = this.randomSquares();
    const settingDelay = this.selectedMode.delay;

    from(randomSquaresArr)
      .pipe(
        concatMap(x => of(x)
          .pipe(
            delay(settingDelay)
          )
        ),
        takeUntil(this.stopGameSubject)
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
    }
  }

  private checkStatusSquare = ({id, loss, win}, square) => id === square.id && !loss && !win;

  private endGame() {
    this.pointsComputer = 0;
    this.pointsUser = 0;

    this.squaresArray.forEach((item: SquareModel) => {
      // tslint:disable-next-line:no-unused-expression
      item.loss && (this.pointsComputer += 1);
      // tslint:disable-next-line:no-unused-expression
      item.win && (this.pointsUser += 1);
    });

    if (this.pointsComputer > this.squaresArray.length / 2 || this.pointsUser > this.squaresArray.length / 2) {
      this.playAgain = true;
      const name = this.pointsComputer > this.pointsUser ? 'Computer' : this.userName;

      this.showGameResult(name);
      this.sendResult();

      this.isGameInProgress = false;
      this.stopGameSubject.next();
    }
  }

  private showGameResult(name) {
    this.winner = name;
  }

  public sendResult() {
    this.httpService.sendResult(new WinnersModel({winner: this.winner, date:
        new Date().getHours() + ':' + new Date().getMinutes() + '; ' + new Date().getDate() + ' '
        + new Date().toLocaleString('eng', { month: 'long' }) + ' ' + new Date().getFullYear()}));
  }

  ngOnDestroy() {
    this.settingsSubscriptions.unsubscribe();
  }
}
