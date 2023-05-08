import { Component } from '@angular/core';
import { ChatService } from './services/chat.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  nickname = '';

  constructor(public chatService: ChatService) {
    this.chatService.getLastMessages(20);
  }

  loadMore() {
    this.chatService.loadMoreMessages(20);
  }

  sendMessage(message: string) {
    if (!message.length) return;

    this.chatService.writeMessage(this.nickname, message);
  }
}
