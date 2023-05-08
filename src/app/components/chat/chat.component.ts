import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { IMessage } from '../../models/messages';

@Component({
  selector: 'chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
})
export class ChatComponent implements AfterViewInit {
  @ViewChild(CdkVirtualScrollViewport)
  viewport: CdkVirtualScrollViewport;
  @Input() messages: IMessage[];
  @Input() loading: boolean = false;
  @Output() loadMore = new EventEmitter();
  @Output() sendMessage = new EventEmitter<string>();
  message = '';

  ngAfterViewInit(): void {
    setTimeout(() => {
      // Scroll to the bottom of the chat after render
      this.viewport.scrollToIndex(this.messages.length - 1, 'auto');
      // Load more messages when scroll to start
      this.viewport.scrolledIndexChange.subscribe((index) => {
        if (index === 0) {
          this.loadMore.emit();
        }
      });
    }, 0);
  }

  handleMessage() {
    if (!this.message.length) return;

    this.sendMessage.emit(this.message);
    this.message = '';
  }
}
