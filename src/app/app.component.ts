/*import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'EleveDashboard';
}*/
import {HttpClient} from '@angular/common/http';
import {Component, ViewChild, AfterViewInit} from '@angular/core';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {merge, Observable, of as observableOf} from 'rxjs';
import {catchError, map, startWith, switchMap} from 'rxjs/operators';

/**
 * @title Table retrieving data through HTTP
 */
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewInit {
  displayedColumns: string[] = ['username','fullname', 'total_followers_count', 'total_following_count','total_post_count'];
  exampleDatabase: UserHTTPDatabase | null;
  data: UserList[] = [];
  resultsLength = 0;
  isLoadingResults = true;
  isRateLimitReached = false;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(private _httpClient: HttpClient) {}

  ngAfterViewInit() {
    this.exampleDatabase = new UserHTTPDatabase(this._httpClient);

    // If the user changes the sort order, reset back to the first page.
    //this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);

    merge(this.sort.sortChange, this.paginator.page)
      .pipe(
        startWith({}),
        switchMap(() => {
          this.isLoadingResults = true;
          return this.exampleDatabase!.getRepoIssues(
            this.sort.active, this.sort.direction, this.paginator.pageIndex);
        }),
        map(data => {
          // Flip flag to show that loading has finished.
         
          this.isLoadingResults = false;
          this.isRateLimitReached = false;
          this.resultsLength = data.total_count;
          
          return data.items;
        }),
        catchError(() => {
          console.log();
          this.isLoadingResults = false;
          this.isRateLimitReached = true;
          return observableOf([]);
        })
      ).subscribe(data => this.data = data);
  }
}

export interface UserAPI {
  items: UserList[];
  total_count: number;
}

export interface UserList {
  fullname: string;
  total_followers_count: string;
  total_following_count: string;
  total_post_count: string;
  username: string;
}



export class UserHTTPDatabase {
  constructor(private _httpClient: HttpClient) {}
  

  getRepoIssues(sort: string, order: string, page: number): Observable<UserAPI> {
    const href = 'https://boring-chandrasekhar-056eb5.netlify.app/.netlify/functions/server/users';
    const requestUrl =`${href}`+'?page='+`${page}`;
    console.log(requestUrl);
    return this._httpClient.get<UserAPI>(requestUrl);
  }
}