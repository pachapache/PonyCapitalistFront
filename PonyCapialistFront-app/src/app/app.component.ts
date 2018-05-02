import { Component, EventEmitter, Output, ViewChild, Input } from '@angular/core';
import { RestserviceService } from './restservice.service';
import { World, Product, Pallier } from './world';
import { ToasterModule, ToasterService } from 'angular2-toaster';
import { ProductComponent } from './product/product.component';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [ToasterModule]
})

export class AppComponent {
  world: World = new World(); 
  server: string; 
  qtmulti: string = "Buy X1";
  etat: number = 0;
  manager: Pallier;
  toasterService: ToasterService;
  manAv: boolean = false;
  managerBuyable: boolean = false;
  username: string;
  productComponentInstance: ProductComponent;
  cashUpgrade: Pallier;
  angelUpgrade: Pallier;

  //@Input() productComponentInstance: ProductComponent;

  constructor(private service : RestserviceService, toasterService: ToasterService, productComponentInstance: ProductComponent){
    this.server = service.getServer();
    this.toasterService = toasterService;
    this.productComponentInstance = productComponentInstance;
    service.getWorld().then(world => { this.world = world; });
  }
  

  ngOnInit() {
    setInterval(() => { this.managerAvailable();
    }, 100);
    this.username = localStorage.getItem("username");
    this.onUsernameChanged();
  }
  
  onUsernameChanged() {
    this.username = localStorage.getItem("username");
    if(this.username == null) {
      this.username = "Captain" + Math.floor(Math.random() * 10000).toString();
      localStorage.setItem("username", this.username);
    }else localStorage.setItem("username", this.username);
  }

  onProductionDone(p: Product) {
    this.world.score += p.revenu;
    this.world.money += p.revenu;
  }
  

  onBuyDone(n: Number) {
    console.log(n);
    this.world.money -= n.valueOf();
  }
  

  choseQtt() {
    this.etat+=1;
    if (this.etat>3) this.etat=0;
    switch(this.etat) {
      case 0:
        this.qtmulti = "Buy X1";
        break;
      case 1:
        this.qtmulti = "Buy X10";
        break;
      case 2:
        this.qtmulti = "Buy X100";
        break;
      case 3:
        this.qtmulti = "Buy MAX";
        break;
    }
  }
  
  managerAvailable(): boolean {
    this.world.managers.pallier.forEach(element => {
      if(element.seuil < this.world.money && element.unlocked == false) {
        this.manAv = true;
        this.managerBuyable = true;
      }
    });
    return this.manAv;
  }

  @Output()
  hireManager(m: Pallier){
    //console.log(m.seuil);
    if (this.world.money <= m.seuil){
     this.toasterService.pop('error', 'Deaths insufisantes ! ', m.name);
    }else {
      this.toasterService.pop('success', 'Manager hired ! ', m.name);
      this.world.money -= m.seuil;
      m.unlocked=true;
      this.world.products.product.forEach(element => {
        if(element.id == m.idcible) {
          element.managerUnlocked=true;
          this.manAv = false;
          this.managerBuyable = false;

          //this.productComponentInstance.startFabrication();
        }
        
      });
    }
   }
}
