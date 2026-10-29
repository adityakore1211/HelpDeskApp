import { Routes } from '@angular/router';

import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
import { Dashboard } from './pages/dashboard/dashboard';
import { Raiseticket } from './pages/raiseticket/raiseticket';
import { MyTickets } from './pages/my-tickets/my-tickets';

import { ViewTicket } from './pages/view-ticket/view-ticket';
import { EditTicket } from './pages/edit-ticket/edit-ticket';

export const routes: Routes = [
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'dashboard', component: Dashboard },
  { path: 'raiseticket', component: Raiseticket },
  { path: 'my-tickets', component: MyTickets },

  { path: 'view-ticket/:id', component: ViewTicket },
  {
    path: 'edit-ticket/:id',
    component: EditTicket
  },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' }
];