import { Injectable, OnDestroy } from '@angular/core';
import {
  addDoc,
  collection,
  collectionData,
  CollectionReference,
  DocumentData,
  Firestore,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
} from '@angular/fire/firestore';
import { IMessage } from '../models/messages';
import {
  BehaviorSubject,
  map,
  Subject,
  switchMap,
  take,
  takeUntil,
  tap,
} from 'rxjs';

@Injectable()
export class ChatService implements OnDestroy {
  private readonly messagesCollection: CollectionReference<DocumentData>;
  private removeSubscriptions: Subject<void> = new Subject();

  // Check if all documents have been fetched
  readonly done$ = new BehaviorSubject(false);
  // To indicate the ending of fetching old messages
  readonly loadingMoreFinished$ = new BehaviorSubject(false);
  // Current messages (to consume by component)
  readonly messages$ = new BehaviorSubject<IMessage[]>([]);

  constructor(private firestore: Firestore) {
    this.messagesCollection = collection(this.firestore, 'messages');
  }

  /**
   * Initializes the service messages$ variable with observable that consists
   * of last messages from collection
   * @param amount number of last messages to be fetched
   */
  getLastMessages(amount = 20): void {
    // Fetch the last messages
    const lastMessages$ = collectionData(
      query(
        this.messagesCollection,
        orderBy('createdAt', 'desc'),
        limit(amount),
      ),
      { idField: 'id' },
    ).pipe(map((arr) => arr.reverse()));

    // Push the lash messages to the data source and give out only to the new ones
    lastMessages$
      .pipe(
        take(1),
        tap((messages) =>
          this.messages$.next(messages as unknown as IMessage[]),
        ),
        switchMap(() =>
          collectionData(
            query(
              this.messagesCollection,
              orderBy('createdAt', 'desc'),
              limit(1),
            ),
            { idField: 'id' },
          ).pipe(
            tap((message) => {
              const currentMessages = this.messages$.getValue();
              if (
                currentMessages.length &&
                currentMessages[currentMessages.length - 1].id !== message[0]['id']
              ) {
                this.messages$.next([
                  ...currentMessages,
                  ...(message as unknown as IMessage[]),
                ]);
              }
            }),
            takeUntil(this.removeSubscriptions),
          ),
        ),
      )
      .subscribe();
  }

  /**
   * Fetches older messages and adds it to them to global messages$ variable
   * @param amount number of old messages to be fetched
   */
  async loadMoreMessages(amount: number): Promise<void> {
    if (this.done$.getValue()) return;

    this.loadingMoreFinished$.next(true);
    const messagesQuery = query(
      this.messagesCollection,
      orderBy('createdAt', 'desc'),
    );
    const documentsSnapshots = await getDocs(messagesQuery);
    const startMessage = documentsSnapshots.docs.find(
      (doc) => doc.id === this.messages$.getValue()[0].id,
    );

    // Fetch more messages
    collectionData(
      query(
        this.messagesCollection,
        orderBy('createdAt', 'desc'),
        startAfter(startMessage),
        limit(amount),
      ),
      { idField: 'id' },
    )
      .pipe(
        take(1),
        map((arr) => arr.reverse()),
        tap((messages) => {
          if (messages.length <= amount - 1) this.done$.next(true);
          this.messages$.next([
            ...(messages as unknown as IMessage[]),
            ...this.messages$.getValue(),
          ]);
          this.loadingMoreFinished$.next(false);
        }),
        takeUntil(this.removeSubscriptions),
      )
      .subscribe();
  }

  /**
   * Adds message to the collection
   * @param name author's nickname
   * @param message message body
   */
  writeMessage(name: string, message: string) {
    addDoc(this.messagesCollection, {
      name: name,
      message: message,
      createdAt: new Date(),
    });
  }

  // End all subscriptions
  ngOnDestroy(): void {
    this.removeSubscriptions.next();
  }
}
