import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginFormComponent } from './login-form/login-form.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ExpensesListComponent } from './expenses-list/expenses-list.component';
import { AuthValidationService } from './services/auth-validation-service/auth-validation.service';
import { NavbarComponent } from './navbar/navbar.component';
import { FooterComponent } from './footer/footer.component';

const routes: Routes = [
  { path: "login", component: LoginFormComponent },
  {
    path: "dashboard",
    component: DashboardComponent,
    canActivate: [AuthValidationService]
  },
  {
    path: "expenses-list",
    component: ExpensesListComponent,
    canActivate: [AuthValidationService]
  },
  { path: "", redirectTo: "login", pathMatch: "full" }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
