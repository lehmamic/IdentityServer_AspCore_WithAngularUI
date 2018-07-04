import { Component, OnInit, Input } from '@angular/core';
import { ScopeDto } from '..';

@Component({
  selector: 'app-scope-list-item',
  templateUrl: './scope-list-item.component.html',
  styleUrls: ['./scope-list-item.component.scss']
})
export class ScopeListItemComponent implements OnInit {
  @Input() scope: ScopeDto;

  constructor() { }

  ngOnInit() {
  }

}
