import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validator, Validators } from '@angular/forms'
import { ITodos } from '../model/todos';
import { ApiService } from '../services/api.service';
import { CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-todo',
  templateUrl: './todo.component.html',
  styleUrls: ['./todo.component.scss']
})
export class TodoComponent implements OnInit{

  todoForm !: FormGroup;
  todos : ITodos[] = [];
  inprogress : ITodos[] = [];
  done : ITodos[] = [];
  data: any;

  indicator : any;

  idTodo : number = 999999;
  deleteStatus : string = '';

  updateIndex!:any;
  isEditEnabled : boolean = false;

  isHideEnabled : boolean = false;

  constructor(private fb : FormBuilder, private api: ApiService) {


  }
  ngOnInit(): void{
    this.todoForm = this.fb.group({
      title : ['', Validators.required],
      description : ['', Validators.required],
    })
    this.getTodos();
    this.getTodosByStatus("1");
    this.getTodosByStatus("2");
    this.getTodosByStatus("3");
  }

  getTodos() {
    this.api.getTodos().subscribe((res) => {
      this.data = res;
      //console.log(this.data);
    });
  }

  getTodosByStatus(s: string) {
    switch (s) {
      case '1':
        this.api.getTodosByState(1).subscribe({
          next: (res)=>{
            res.map((todo : any ) => {
              this.todos.push({
                title: todo.todoTitle,
                description: todo.todoDescription,
                status: todo.statusId
              })
            })
            //console.log("Todos migration succesfully");

          },
          error:()=>{
            alert("Error to include ToDos into TODO List")
          }
        })
        break;
      case '2':
        this.api.getTodosByState(2).subscribe({
          next: (res)=>{
            res.map((todo : any ) => {
              this.inprogress.push({
                title: todo.todoTitle,
                description: todo.todoDescription,
                status: todo.statusId
              })
            })
            //console.log("Inprogress migration succesfully");

          },
          error:()=>{
            alert("Error to include ToDos into INPROGRESS List")
          }
        })
        break;
      case '3':
        this.api.getTodosByState(3).subscribe({
          next: (res)=>{
            res.map((todo : any ) => {
              this.done.push({
                title: todo.todoTitle,
                description: todo.todoDescription,
                status: todo.statusId
              })
            })
            //console.log("Done migration succesfully");

          },
          error:()=>{
            alert("Error to include ToDos into DONE List")
          }
        })
        break;
      default:
        console.log('status undefined! check the data');
    }
  }

  getTodoById(id : any) {
    this.api.getTodoById(id).subscribe((res) => {
      this.data = res;
      console.log(this.data);
    });
  }

  addTodo() {

    if(this.todoForm.valid) {
      this.api.postTodo({
        "completedDate": null,
        "createdDate": new Date(),
        "statusId": 1,
        "todoDescription": this.todoForm.value.description,
        "todoTitle": this.todoForm.value.title,
      }).subscribe({
        next: (res)=>{
          //alert("Todo added successfully");
          this.todos.push({
            title: this.todoForm.value.title,
            description: this.todoForm.value.description,
            status: 1
          })
          this.resetLists()
          this.todoForm.reset();
          this.getTodosByStatus("1");
          this.getTodosByStatus("2");
          this.getTodosByStatus("3");
        },
        error:()=>{
          alert("Error to add ToDo, Try Again!")
        }
      })
    } else {
      console.log("Form not valid");
    }
  }
  editTodo(todo:ITodos, i: number) {
      this.todoForm.controls['title'].setValue(todo.title);
      this.todoForm.controls['description'].setValue(todo.description);
      this.updateIndex = i;
      this.isEditEnabled = true;
  }

  resetLists() {
    this.todos	= [];
    this.inprogress = [];
    this.done = [];
  }

  updateTodo(){
    if(this.todoForm.valid) {
      this.data.find((e: any) => {
        if(e.todoDescription == this.todos[this.updateIndex].description && e.todoTitle == this.todos[this.updateIndex].title) {
          this.idTodo = e.todoId
        } else {
          return
        }
      });
      console.log(this.idTodo);

      this.api.postTodo({
        "todoId": this.idTodo,
        "todoDescription": this.todoForm.value.description,
        "todoTitle": this.todoForm.value.title,
        "statusId": 1,
        "createdDate": new Date(),
      }).subscribe({
        next: (res)=>{
          //alert("Todo updated successfully");
          this.todos[this.updateIndex].title = this.todoForm.value.title;
          this.todos[this.updateIndex].description = this.todoForm.value.description;
          this.todoForm.reset();
          this.updateIndex = undefined;
          this.isEditEnabled = false;
          this.resetLists()
          this.getTodosByStatus("1");
          this.getTodosByStatus("2");
          this.getTodosByStatus("3");
        },
        error:()=>{
          alert("Error to update ToDo, Try Again!")
        }
      })
    } else {
      console.log("Form not valid");
    }
  }
  deleteTodo(i: number) {
    this.idTodo = this.data.find((e: any) => e.todoTitle == this.todos[i].title).todoId;
    console.log(this.idTodo);
    this.api.deleteTodo(this.idTodo).subscribe({
      next: data => {
        this.deleteStatus = 'Delete successful';
        console.log(this.deleteStatus);
      }, error: error => {
        this.deleteStatus = error.message;
        console.error('There was an error!', this.deleteStatus);
      }
    })
    this.todos.splice(i,1);
  }

  deleteTodoInProgress(i: number) {
    this.idTodo = this.data.find((e: any) => e.todoTitle == this.inprogress[i].title).todoId;
    console.log(this.idTodo);
    this.api.deleteTodo(this.idTodo).subscribe({
      next: data => {
        this.deleteStatus = 'Delete successful';
        console.log(this.deleteStatus);

      }, error: error => {
        this.deleteStatus = error.message;
        console.error('There was an error!', this.deleteStatus);
      }
    })
    this.inprogress.splice(i,1)
  }

  hideTodoDone(i: number) {
    this.done.splice(i,1)
  }

  updateStatus(eventData : any, indx : any) {

    this.idTodo = this.data.find((e: any) => e.todoTitle == eventData[indx].title).todoId;

    this.todos.map((e => e.status = 1))
    this.inprogress.map((e => e.status = 2))
    this.done.map((e => e.status = 3))

    if(eventData[indx].status != 3) {
      this.api.postTodo({
        "todoId": this.idTodo,
        "todoDescription": eventData[indx].description,
        "todoTitle": eventData[indx].title,
        "statusId": eventData[indx].status,
        "createdDate": new Date(),
      }).subscribe({
        next: (res)=>{
          console.log(`changes status to: ${eventData[indx].status}`);
        },
        error:()=>{
          alert("Error to update ToDo, Try Again!")
        }
      })
    } else (
      this.api.postTodo({
        "todoId": this.idTodo,
        "todoDescription": eventData[indx].description,
        "todoTitle": eventData[indx].title,
        "statusId": eventData[indx].status,
        "completedDate": new Date()
      }).subscribe({
        next: (res)=>{
          console.log(`changes status to: ${eventData[indx].status}`);
        },
        error:()=>{
          alert("Error to update ToDo, Try Again!")
        }
      })
    )
  }

  drop(event: CdkDragDrop<ITodos[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );
      this.updateStatus(event.container.data, event.currentIndex);
      //console.log(event.container.data);

    }
  }

}
