import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpModule } from '@angular/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Configuration } from '../configuration';
import { DataService } from '../data.service';
import { TransactionRBComponent } from './TransactionRB.component';
import {TransactionRBService} from './TransactionRB.service';

describe('TransactionComponent', () => {
  let component: TransactionRBComponent;
  let fixture: ComponentFixture<TransactionRBComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TransactionRBComponent ],
      imports: [
          BrowserModule,
          FormsModule,
          ReactiveFormsModule,
          HttpModule
        ],
      providers: [TransactionRBService,DataService,Configuration]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TransactionRBComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
