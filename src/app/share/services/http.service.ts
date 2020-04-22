import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {BehaviorSubject, Observable} from 'rxjs';
import {SettingsModel} from '../models/settings.model';
import {WinnersModel} from '../models/winners.model';

@Injectable({
  providedIn: 'root'
})
export class HttpService {

  constructor(private http: HttpClient) {
    this.getWinners();
  }
  private httpOptions = {
    headers: new HttpHeaders({'Content-Type': 'application/json; charset=utf-8'})
  };

  URL_SETTINGS = 'http://starnavi-frontend-test-task.herokuapp.com/game-settings';
  URL_WINNERS = 'http://starnavi-frontend-test-task.herokuapp.com/winners';

  subscribeEvent = new BehaviorSubject([]);

  getSettings(): Observable<SettingsModel> {
    return this.http.get<SettingsModel>(this.URL_SETTINGS, this.httpOptions);
  }

  getWinners() {
    return this.http.get(this.URL_WINNERS, this.httpOptions)
      .subscribe((list: any) => this.subscribeEvent.next(list.reverse()));
  }

  sendResult(winner: WinnersModel) {
    return this.http.post(this.URL_WINNERS, winner, this.httpOptions).subscribe({
      next: () => {
        this.getWinners();
      },
      error: error => {
        console.error('There was an error!', error);
      }
    });
  }

  getWinnersList(): Observable<any> {
    return this.subscribeEvent;
  }
}
