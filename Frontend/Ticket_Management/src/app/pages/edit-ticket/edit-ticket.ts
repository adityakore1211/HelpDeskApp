import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Ticket as TicketService } from '../../services/ticket';

@Component({
  selector: 'app-edit-ticket',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './edit-ticket.html',
  styleUrl: './edit-ticket.css'
})
export class EditTicket implements OnInit {

  ticketId = '';

  ticket = {
    title: '',
    description: '',
    category: 'Technical',
    priority: 'Medium',
    status: 'Open'
  };

  categories = ['Technical', 'Access', 'Hardware', 'Software', 'Other'];
  priorities = ['Low', 'Medium', 'High'];
  statuses = ['Open', 'In Progress', 'Resolved'];         //'Closed

  isLoading = true;
  isSaving = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private ticketService: TicketService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.ticketId = params.get('id') || '';

      if (!this.ticketId) {
        this.isLoading = false;
        this.errorMessage = 'Ticket ID is missing.';
        this.cdr.detectChanges();
        return;
      }

      this.loadTicket();
    });
  }

  loadTicket(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.cdr.detectChanges();

    this.ticketService.getTicketById(this.ticketId).subscribe({
      next: (response: any) => {
        console.log('Edit ticket API response:', response);

        const data = response?.ticket ?? response?.data ?? response;

        if (!data || !data.title) {
          this.errorMessage = 'Ticket details were not found in the response.';
          this.isLoading = false;
          this.cdr.detectChanges();
          return;
        }

        this.ticket = {
          title: data.title ?? '',
          description: data.description ?? '',
          category: data.category ?? 'Technical',
          priority: data.priority ?? 'Medium',
          status: data.status ?? 'Open'
        };

        this.isLoading = false;
        this.cdr.detectChanges();
      },

      error: (error: any) => {
        console.error('Edit ticket API error:', error);

        this.errorMessage =
          error?.error?.message ||
          `Unable to load ticket. HTTP status: ${error.status}`;

        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  saveTicket(): void {
    if (this.isSaving || !this.ticketId) {
      return;
    }

    this.isSaving = true;
    this.errorMessage = '';

    this.ticketService.updateTicket(this.ticketId, {
      title: this.ticket.title,
      description: this.ticket.description,
      category: this.ticket.category,
      priority: this.ticket.priority,
      status: this.ticket.status
    }).subscribe({
      next: () => {
        this.isSaving = false;
        this.cdr.detectChanges();
        this.router.navigate(['/view-ticket', this.ticketId]);
      },

      error: (error: any) => {
        console.error('Update ticket error:', error);

        this.isSaving = false;
        this.errorMessage =
          error?.error?.message || 'Failed to update ticket.';

        this.cdr.detectChanges();
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/view-ticket', this.ticketId]);
  }
}
