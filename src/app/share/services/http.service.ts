import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {Observable} from "rxjs";
import {SettingsModel} from "../models/settings.model";
import {WinnersModel} from "../models/winners.model";

@Injectable({
  providedIn: 'root'
})
export class HttpService {

  constructor(private http: HttpClient) {
  }
  private httpOptions = {
    headers: new HttpHeaders({'Content-Type': 'application/json; charset=utf-8'})
  };

  URL_SETTINGS = 'http://starnavi-frontend-test-task.herokuapp.com/game-settings';
  URL_WINNERS = 'http://starnavi-frontend-test-task.herokuapp.com/winners';

  getSettings(): Observable<SettingsModel> {
    return this.http.get<SettingsModel>(this.URL_SETTINGS, this.httpOptions);
  }

  getWinners(): Observable<WinnersModel[]> {
    return this.http.get<WinnersModel[]>(this.URL_WINNERS, this.httpOptions);
  }
}
