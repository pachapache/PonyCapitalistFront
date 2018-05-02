import { Component, OnInit, Output, EventEmitter, ViewChild, Input } from '@angular/core';
import { Product, World } from '../world';
import { RestserviceService } from '../restservice.service';
import { AppComponent } from '../app.component';
import { ToasterModule, ToasterService } from 'angular2-toaster';


declare var require; 
const ProgressBar = require("progressbar.js");

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.css']
})

export class ProductComponent implements OnInit {
  product: Product;
  server: string;
  progressbar: any;
  lastupdate: any;
  world: World;
  _qtmulti: string;
  _money: number; 
  nbAchat: number = 1;
  prix: number;
  revenu: number;
  barIsRunning: boolean = false;
  buyable: boolean = false;
  toasterService: ToasterService;
  

  @ViewChild('bar') progressBarItem;

  @Input()
  set prod(value: Product) {
    this.product = value;
  }

  @Input()
  set qtmulti(value: string) {
    this._qtmulti = value;
    if (this._qtmulti && this.product)
      this.calcMaxCanBuy();
  }

  @Input()
  set money(value: number) {
    this._money = value;
  }

  calcMaxCanBuy() {
    //console.log(this._money);
    this.buyable = false;
    switch(this._qtmulti) {
      case "Buy X1":
        this.prix=this.product.cout;
        this.prix=parseInt(this.prix.toString() ,10);
        this.nbAchat=1;
        break;
      case "Buy X10":
        this.prix=this.product.cout*((1-Math.pow(this.product.croissance, 11) )/ (1-this.product.croissance));
        this.prix=parseInt(this.prix.toString() ,10);
        this.nbAchat=10;
        break;
      case "Buy X100":
        this.prix=this.product.cout*((1-Math.pow(this.product.croissance, 101) )/ (1-this.product.croissance));
        this.prix=parseInt(this.prix.toString() ,10);
        this.nbAchat=100;
        break;
      case "Buy MAX": //Gros problème avec cette fonction, on peut en acheter 0 et quand meme gagner du gain
        this.nbAchat = Math.log(1-(this._money/this.product.cout)*(1-this.product.croissance))/Math.log(this.product.croissance); 
        this.nbAchat=parseInt(this.nbAchat.toString() ,10);
        this.prix = this.product.cout*((1-Math.pow(this.product.croissance, this.nbAchat) )/ (1-this.product.croissance));
        this.prix=parseInt(this.prix.toString() ,10);
        if(this.nbAchat < 1) this.buyable = false;
        break;
    }
  }

  @Output() 
  notifyProduction: EventEmitter<Product> = new EventEmitter<Product>();
  constructor(private service : RestserviceService) { 
    this.server = service.getServer();
  }

  @Output() 
  public onBuy: EventEmitter<Number> = new EventEmitter<Number>();
  

  ngOnInit() {
    this.progressbar = new ProgressBar.Line(this.progressBarItem.nativeElement, 
      { strokeWidth: 50, color: 'grey' });
    setInterval(() => { this.calcScore(); this.calcMaxCanBuy(); this.isBuyable();
    }, 100);
    /*this.revenu = this.product.revenu;
    this.revenu = parseInt(this.revenu.toString(), 10);*/
  }

  calcScore(){
    if (this.product.timeleft!=0){
      this.product.timeleft -= Date.now()-this.lastupdate ;
      this.lastupdate=Date.now();
      //console.log(this.product.timeleft);
      if (this.product.timeleft <= 0 && this.product.managerUnlocked==false) { // si le manager n'est pas acheté
        this.progressbar.set(0);
        this.notifyProduction.emit(this.product);
        this.product.timeleft=0;
        this.barIsRunning = false;
      }
      if (this.product.timeleft <= 0 && this.product.managerUnlocked==true) { // si le manager est activé
        this.barIsRunning = false;
        this.progressbar.set(0);
        this.product.timeleft=0;
        this.startFabrication();
        this.notifyProduction.emit(this.product);
        }
      }
    }
  
  isBuyable(){
    if(this.prix <= this._money) {
      this.buyable = true;
    }
  }

  startFabrication(){
    if (this.product.quantite!=0 && this.barIsRunning == false) {
      this.barIsRunning = true;
      this.product.timeleft=this.product.vitesse;
      this.progressbar.animate(1, { duration: this.product.vitesse });
      this.lastupdate=Date.now();
    }
  }

  buyProduct(){
    //console.log("argent " + this._money);
    //console.log("prix" + this.prix);
    if(this._money < this.prix){ // vérifier qu'il y a assez d'argent pour acheter le produit
      alert("Vous n'avez pas assez pour acheter ce produit");
    }else{
    //alert(" Bravo vous avez acheté "+ this.nbAchat +" death(s)");
    this.product.quantite += this.nbAchat; // augmente le nombre de produits
    this.product.revenu = this.product.quantite*this.product.revenu *this.product.croissance;  //augmente le revenu d'un click 
    this.onBuy.emit(this.prix); // notifie qu'il doit enlever la somme du prix 
    this.buyable = false;
    this.toasterService.pop('success', " Bravo vous avez acheté "+ this.nbAchat +" death(s)");
    }
  }
}
