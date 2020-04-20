import {Component, OnInit} from '@angular/core';
import {HttpService} from '../share/services/http.service';
import {Observable} from 'rxjs';
import {WinnersModel} from '../share/models/winners.model';

@Component({
  selector: 'app-leader-board',
  templateUrl: './leader-board.component.html',
  styleUrls: ['./leader-board.component.scss']
})
export class LeaderBoardComponent implements OnInit {

  constructor(private httpService: HttpService) { }

  winnersList: Observable<WinnersModel[]>;
  isLoad: boolean;

  ngOnInit(): void {
    this.isLoad = false;
    this.loadWinners();
  }

  loadWinners() {
    this.winnersList = this.httpService.getWinnersList();
    this.isLoad = true;
  }
}
