import { Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';
import {
  NavigationEnd,
  NavigationError,
  NavigationStart,
  Router,
} from '@angular/router';
import { filter } from 'rxjs/operators';

import { Angulartics2, EventHubsSettings } from 'angulartics2';

import { EventHubClient } from '@azure/event-hubs'
// declare const eventHubs: Microsoft.ApplicationInsights.IAppInsights;

export class EventHubsDefaults implements EventHubsSettings {
  userId = null;
  sessionId = null;
  pageId = null;
  evtHubName = null;
  evtHubConnString = null;
}

@Injectable({ providedIn: 'root' })
export class Angulartics2EventHubs {
  loadStartTime: number = null;
  loadTime: number = null;

  metrics: { [name: string]: number } = null;
  dimensions: { [name: string]: string } = null;
  measurements: { [name: string]: number } = null;

  client: EventHubClient = null;

  constructor(
    private angulartics2: Angulartics2,
    private title: Title,
    private router: Router,
  ) {

    const defaults = new EventHubsDefaults();
    // Set the default settings for this module
    this.angulartics2.settings.eventHubs = { ...defaults, ...this.angulartics2.settings.eventHubs };
    this.angulartics2.setUsername
      .subscribe((x: string) => this.setUsername(x));
    this.angulartics2.setUserProperties
      .subscribe((x) => this.setUserProperties(x));
    
    if(this.angulartics2.settings.eventHubs.evtHubName && this.angulartics2.settings.eventHubs.evtHubConnString)
    {
      //init EventHub Client
      this.client = EventHubClient.createFromConnectionString(this.angulartics2.settings.eventHubs.evtHubConnString, this.angulartics2.settings.eventHubs.evtHubName);
    }
  }

  startTracking(): void {
    // this.angulartics2.pageTrack
    //   .pipe(this.angulartics2.filterDeveloperMode())
    //   .subscribe((x) => this.pageTrack(x.path));
    this.angulartics2.eventTrack
      .pipe(this.angulartics2.filterDeveloperMode())
      .subscribe((x) => this.eventTrack(x.action, x.properties));
    // this.angulartics2.exceptionTrack
    //   .pipe(this.angulartics2.filterDeveloperMode())
    //   .subscribe((x) => this.exceptionTrack(x));
    // this.router.events
    //   .pipe(
    //     this.angulartics2.filterDeveloperMode(),
    //     filter(event => event instanceof NavigationStart),
    // )
    //   .subscribe(event => this.startTimer());

    // this.router.events
    //   .pipe(filter(event => event instanceof NavigationError || event instanceof NavigationEnd))
    //   .subscribe(error => this.stopTimer());
  }

  startTimer() {
    this.loadStartTime = Date.now();
    this.loadTime = null;
  }

  stopTimer() {
    this.loadTime = Date.now() - this.loadStartTime;
    this.loadStartTime = null;
  }

  /**
   * Log a user action or other occurrence.
   *
   * @param name Name to identify this event in the portal.
   * @param properties Additional data used to filter events and metrics in the portal. Defaults to empty.
   *
   * @link https://github.com/Microsoft/ApplicationInsights-JS/blob/master/API-reference.md#trackevent
   */
  eventTrack(partitionKey: string, body: any ) {
    this.client.send({ body, partitionKey});
  }

  /**
   * @link https://github.com/Microsoft/ApplicationInsights-JS/blob/master/API-reference.md#setauthenticatedusercontext
   */
  setUsername(userId: string) {
    this.angulartics2.settings.eventHubs.userId = userId;
    // appInsights.setAuthenticatedUserContext(userId);
  }

    /**
   * @link https://github.com/Microsoft/ApplicationInsights-JS/blob/master/API-reference.md#setauthenticatedusercontext
   */
  setSessionId(sessionId: string) {
    this.angulartics2.settings.eventHubs.sessionId = sessionId;
    // appInsights.setAuthenticatedUserContext(userId);
  }

      /**
   * @link https://github.com/Microsoft/ApplicationInsights-JS/blob/master/API-reference.md#setauthenticatedusercontext
   */
  setPageId(sessionId: string) {
    this.angulartics2.settings.eventHubs.pageId = sessionId;
    // appInsights.setAuthenticatedUserContext(userId);
  }

  setUserProperties(properties: Partial<{ userId: string, sessionId: string, pageId: string }>) {
    if (properties.userId) {
      this.angulartics2.settings.eventHubs.userId = properties.userId;
    }
    if (properties.sessionId) {
      this.angulartics2.settings.eventHubs.userId = properties.sessionId;
    }
    if (properties.pageId) {
      this.angulartics2.settings.eventHubs.pageId = properties.pageId;
    }
  }
}
