import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ScopeListItemComponent } from './scope-list-item.component';

describe('ScopeListItemComponent', () => {
  let component: ScopeListItemComponent;
  let fixture: ComponentFixture<ScopeListItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ScopeListItemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScopeListItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
