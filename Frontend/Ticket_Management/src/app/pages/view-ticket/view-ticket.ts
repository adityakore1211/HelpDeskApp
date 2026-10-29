
import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { Ticket as TicketService } from '../../services/ticket';

@Component({
  selector: 'app-view-ticket',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './view-ticket.html',
  styleUrl: './view-ticket.css'
})
export class ViewTicket implements OnInit, OnDestroy {
  ticket: any = null;
  isLoading = true;
  errorMessage = '';

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private ticketService: TicketService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    console.log('ViewTicket component initialized');

    // Read the ticket ID from the route.
    this.route.paramMap
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        const id = params.get('id');

        console.log('Ticket MongoDB ID:', id);

        if (!id) {
          this.ticket = null;
          this.isLoading = false;
          this.errorMessage = 'Ticket ID is missing.';
          return;
        }

        this.loadTicket(id);
      });
  }

  loadTicket(id: string): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.ticket = null;

    this.ticketService.getTicketById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          console.log('Ticket API response:', response);

          this.ticket = response?.ticket ?? response;
          this.isLoading = false;

          if (!this.ticket || !this.ticket._id) {
            this.ticket = null;
            this.errorMessage = 'Ticket details were not found.';
          }

          this.cdr.detectChanges();
        },

        error: (error: any) => {
          console.error('Ticket API error:', error);

          this.ticket = null;
          this.isLoading = false;
          this.errorMessage =
            error?.error?.message ||
            error?.message ||
            'Unable to load ticket details. Please try again.';

          this.cdr.detectChanges();
        }
      });
  }

  editTicket(): void {
    if (this.ticket?._id) {
      this.router.navigate(['/edit-ticket', this.ticket._id]);
    }
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
