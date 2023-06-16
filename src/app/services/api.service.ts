import { state } from '@angular/animations';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private url = "scotia-todo/api"

  constructor(private http : HttpClient) { }

  postTodo(data: any){
    return this.http.post("http://localhost:8090/scotia-todo/api/todos/save", data)
  }

  getTodoById(todoId: any){
    return this.http.get(`http://localhost:8090/${this.url}/todos/${todoId}`);
  }

  getTodos(){
    return this.http.get(`http://localhost:8090/${this.url}/todos/all`);
  }
  getTodosByState(stateId: number) : Observable<any>{
    return this.http.get(`http://localhost:8090/${this.url}/todos/state/${stateId}`)
  }
  deleteTodo(todoId: any){
    return this.http.delete(`http://localhost:8090/${this.url}/todos/delete/${todoId}`)
  }
}
