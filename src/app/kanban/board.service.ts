import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import * as firebase from 'firebase/app';
import { switchMap, map } from 'rxjs/operators';
import { Board, Task } from './board.model';

@Injectable({
  providedIn: 'root'
})
export class BoardService {
  constructor(private afAuth: AngularFireAuth, private db: AngularFirestore) {}

  /**
   * Creates a new board for the current user
   */
  async createBoard(data: Board) {
    const user = await this.afAuth.auth.currentUser;
    const dt = new Date().toISOString().slice(0, 10)
    return this.db.collection('boards').add({
      ...data,
      uid: user.uid,
      tasks: [{ description: 'Hello!', label: 'yellow', startdate: dt }]
    });
  }

  /**
   * Get all boards owned by current user
   */
  getUserBoards() {
    return this.afAuth.authState.pipe(
      switchMap(user => {
        if (user) {
          return this.db
            .collection<Board>('boards', ref =>
              ref.where('uid', '==', user.uid).orderBy('priority')
//                ref.where('uid', '==', 'fgEKjlKWp4RYQBQt0fjJLDg9Unf1').orderBy('startdate')
//                ref.orderBy('startdate')
            )
            .valueChanges({ idField: 'id' });
        } else {
          return [];
        }
      }),
      // map(boards => boards.sort((a, b) => a.priority - b.priority))
    );
  }

  /**
   * Run a batch write to change the priority of each board for sorting
   */
  sortBoards(boards: Board[]) {
    const db = firebase.firestore();
    const batch = db.batch();
    const refs = boards.map(b => db.collection('boards').doc(b.id));
    refs.forEach((ref, idx) => batch.update(ref, { priority: idx }));
    batch.commit();
  }

  /**
   * Delete board
   */
  deleteBoard(boardId: string) {
    return this.db
      .collection('boards')
      .doc(boardId)
      .delete();
  }

  /**
   * Updates the tasks on board
   */
  updateTasks(boardId: string, tasks: Task[]) {
    console.log("Comes here " + tasks.toString);

    // Define color based on Month

    let labelOptions = ["purple", "blue", "green", "yellow", "red", 'olive','purple', 'blue', 'green', 'yellow', 'red', 'olive','purple'];

     //Convert Date ISO to String so that it shows prefilled
     for (var i=0;i<tasks.length;i++)
    {
      if (tasks[i].startdate)
      tasks[i].startdate = new Date(tasks[i].startdate).toISOString().slice(0, 10);
      tasks[i].label = labelOptions[parseInt(tasks[i].startdate.split('-')[1])];
    }
    //Sort Tasks by Date
    tasks.sort(compare);

        function compare(a, b) {
        const genreA = a.startdate;
        const genreB = b.startdate;

        let comparison = 0;
        if (genreA > genreB) {
          comparison = 1;
        } else if (genreA < genreB) {
          comparison = -1;
        }
        return comparison;
      }


    return this.db
      .collection('boards')
      .doc(boardId)
      .update({ tasks });
  }

  /**
   * Remove a specifc task from the board
   */
  removeTask(boardId: string, task: Task) {
    return this.db
      .collection('boards')
      .doc(boardId)
      .update({
        tasks: firebase.firestore.FieldValue.arrayRemove(task)
      });
  }
}
