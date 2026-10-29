import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { Auth } from '../../services/auth';
import { filter, Subscription } from 'rxjs';
import { Ticket as TicketService } from '../../services/ticket';

interface DashboardTicket {
  mongoId: string;
  id: string;
  username: string;
  title: string;
  category: string;
  priority: string;
  status: string;
  createdDate: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit, OnDestroy {

  searchText = '';
  statusFilter = '';
  isLoading = false;
  errorMessage = '';

  tickets: DashboardTicket[] = [];

  private routerSubscription?: Subscription;

  constructor(
    private router: Router,
    private ticketService: TicketService,
    private cdr: ChangeDetectorRef,
    public auth: Auth
  ) { }

  get isAdmin(): boolean {
    return this.auth.getRole() === 'admin';
  }


  get currentUsername(): string {
    return this.auth.getCurrentUser()?.username || 'User';
  }

  get currentUserEmail(): string {
    return this.auth.getCurrentUser()?.email || '';
  }

  get userInitial(): string {
    return this.currentUsername
      .trim()
      .charAt(0)
      .toUpperCase() || 'U';
  }


  ngOnInit(): void {
    // Load tickets when Dashboard is initialized
    this.loadRecentTickets();

    // Refresh whenever navigation returns to Dashboard
    this.routerSubscription = this.router.events
      .pipe(
        filter(
          (event): event is NavigationEnd =>
            event instanceof NavigationEnd
        )
      )
      .subscribe((event) => {
        const currentUrl = event.urlAfterRedirects.split('?')[0];

        if (
          currentUrl === '/dashboard' ||
          currentUrl === '/dashboard/'
        ) {
          this.loadRecentTickets();
        }
      });
  }

  ngOnDestroy(): void {
    this.routerSubscription?.unsubscribe();
  }

  // Load tickets from the backend
  loadRecentTickets(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.ticketService.getRecentTickets().subscribe({
      next: (response: any) => {
        console.log('Dashboard API response:', response);

        const ticketList = Array.isArray(response)
          ? response
          : Array.isArray(response?.tickets)
            ? response.tickets
            : [];

        this.tickets = ticketList.map((ticket: any) => ({
          mongoId: String(ticket._id || ''),
          id: ticket.ticketId
            ? `#${ticket.ticketId}`
            : `#${ticket._id || ''}`,

          username:
            ticket.user?.username ||
            ticket.createdBy?.username ||
            ticket.username ||
            'Unknown User',

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

        console.log('Updated dashboard tickets:', this.tickets);
      },

      error: (error) => {
        console.error('Failed to load recent tickets:', error);

        this.errorMessage =
          'Unable to load tickets. Please check the backend server.';

        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  // Search and status filtering
  get filteredTickets(): DashboardTicket[] {
    const search = this.searchText.trim().toLowerCase();

    return this.tickets.filter((ticket) => {
      const matchesSearch =
        ticket.id.toLowerCase().includes(search) ||
        ticket.title.toLowerCase().includes(search);

      const matchesStatus =
        !this.statusFilter ||
        ticket.status === this.statusFilter;

      return matchesSearch && matchesStatus;
    });
  }

  // Dashboard statistics
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

  // Count both Resolved and Closed tickets
  get resolvedTickets(): number {
    return this.tickets.filter(
      ticket =>
        ticket.status === 'Resolved'
      // || ticket.status === 'Closed'
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

      // case 'Closed':
      //   return 'closed';

      default:
        return '';
    }
  }

  // Navigate to Create Ticket
  createTicket(): void {
    this.router.navigate(['/raiseticket']);
  }

  // Open ticket details using MongoDB ID
  viewTicket(ticket: DashboardTicket): void {
    if (!ticket.mongoId) {
      console.error('MongoDB ticket ID is missing:', ticket);
      return;
    }

    this.router.navigate(['/view-ticket', ticket.mongoId]);
  }

  // Open Edit Ticket using MongoDB ID
  editTicket(ticket: DashboardTicket): void {
    if (!ticket.mongoId) {
      console.error('MongoDB ticket ID is missing:', ticket);
      this.errorMessage =
        'Unable to edit ticket: Ticket ID is missing.';
      return;
    }

    this.router.navigate(['/edit-ticket', ticket.mongoId]);
  }

  // Logout
  logout(): void {
    this.router.navigate(['/login']);
  }
}
