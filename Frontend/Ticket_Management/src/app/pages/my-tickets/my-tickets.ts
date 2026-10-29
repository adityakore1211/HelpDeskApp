import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { Ticket as TicketService } from '../../services/ticket';
import { Auth } from '../../services/auth';
import { filter, Subscription } from 'rxjs';

interface Ticket {
  mongoId: string;
  ticketId: string;
  title: string;
  category: string;
  priority: string;
  status: string;
  createdDate: string;
}

@Component({
  selector: 'app-my-tickets',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './my-tickets.html',
  styleUrl: './my-tickets.css'
})
export class MyTickets implements OnInit, OnDestroy {
  searchText = '';
  statusFilter = '';
  isLoading = false;
  errorMessage = '';
  tickets: Ticket[] = [];

  private routerSubscription?: Subscription;

  constructor(
    private router: Router,
    private ticketService: TicketService,
    private auth: Auth,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Load tickets when the page opens
    this.loadMyTickets();

    // Reload tickets whenever navigation returns to My Tickets
    this.routerSubscription = this.router.events
      .pipe(
        filter(
          (event): event is NavigationEnd =>
            event instanceof NavigationEnd
        )
      )
      .subscribe(event => {
        const currentUrl = event.urlAfterRedirects.split('?')[0];

        if (
          currentUrl === '/my-tickets' ||
          currentUrl === '/my-tickets/'
        ) {
          this.loadMyTickets();
        }
      });
  }

  ngOnDestroy(): void {
    this.routerSubscription?.unsubscribe();
  }

  loadMyTickets(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.ticketService.getMyTickets().subscribe({
      next: (response: any) => {
        console.log('My Tickets API response:', response);

        const ticketList = Array.isArray(response)
          ? response
          : Array.isArray(response?.tickets)
            ? response.tickets
            : [];

        this.tickets = ticketList.map((ticket: any) => ({
          mongoId: String(ticket._id || ''),
          ticketId: ticket.ticketId
            ? `#${ticket.ticketId}`
            : `#${ticket._id || 'N/A'}`,
          title: ticket.title || 'Untitled',
          category: ticket.category || 'Other',
          priority: ticket.priority || 'Medium',
          status: ticket.status || 'Open',
          createdDate: ticket.createdAt
            ? new Date(ticket.createdAt).toLocaleDateString(
                'en-GB',
                {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric'
                }
              )
            : 'N/A'
        }));

        this.isLoading = false;
        this.cdr.markForCheck();

        console.log('Updated My Tickets:', this.tickets);
      },

      error: (error: any) => {
        console.error('Unable to load My Tickets:', error);

        this.errorMessage =
          error.error?.message ||
          'Unable to load your tickets. Please log in again if your session has expired.';

        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  get filteredTickets(): Ticket[] {
    const search = this.searchText.trim().toLowerCase();

    return this.tickets.filter(ticket => {
      const matchesSearch =
        ticket.ticketId.toLowerCase().includes(search) ||
        ticket.title.toLowerCase().includes(search);

      const matchesStatus =
        !this.statusFilter ||
        ticket.status === this.statusFilter;

      return matchesSearch && matchesStatus;
    });
  }

  get totalTickets(): number {
    return this.tickets.length;
  }

  get openTickets(): number {
    return this.tickets.filter(
      ticket => ticket.status === 'Open'
    ).length;
  }

  get inProgressTickets(): number {
    return this.tickets.filter(
      ticket => ticket.status === 'In Progress'
    ).length;
  }

  get resolvedTickets(): number {
    return this.tickets.filter(
      ticket => ticket.status === 'Resolved'
    ).length;
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Open':
        return 'open';
      case 'In Progress':
        return 'progress';
      case 'Resolved':
        return 'resolved';
      default:
        return '';
    }
  }

  viewTicket(ticket: Ticket): void {
    if (ticket.mongoId) {
      this.router.navigate([
        '/view-ticket',
        ticket.mongoId
      ]);
    }
  }

  raiseTicket(): void {
    this.router.navigate(['/raiseticket']);
  }

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
