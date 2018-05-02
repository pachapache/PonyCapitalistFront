import { Http, Response, Headers } from '@angular/http' 
import { World, Pallier, Product } from './world';
import { Injectable } from '@angular/core';

@Injectable()
export class RestserviceService {
  server = "http://localhost:8080/PonyCapitalistBack/"; 
  user = "";


  constructor(private http: Http) { }

  public getUser(){
    return this.user;
  }

  public setUser(user: string){
     this.user=user;
  }

  public getServer(){
    return this.server;
  }

  public setServer(server: string){
     this.server=server;
  }

  private handleError(error: any): Promise<any> { 
    console.error('An error occurred', error); 
    return Promise.reject(error.message || error); 
  } 
  
  getWorld(): Promise<World> { 
    return this.http.get(this.server + "webresources/generic/world2").toPromise().then(response =>response.json()).catch(this.handleError); 
  };

  private setHeaders(user : string) : Headers { 
    var headers = new Headers(); 
    headers.append("X-User",user); 
  return headers; 
  }
  putManager(manager : Pallier): Promise<Response> { 
    return this.http.put(this.server + "webresources/generic/manager", manager, { headers: this.setHeaders(this.user)} ) .toPromise(); 
  }
}
