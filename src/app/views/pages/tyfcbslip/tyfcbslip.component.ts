import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TyfcbService, TyfcbData, TyfcbResponse, CreateTyfcbRequest } from '../../../services/tyfcbslip.service';
import { ReferralService, User } from '../../../services/referral.service';
import { swalHelper } from 'src/app/core/constants/swal-helper';

@Component({
  selector: 'app-tyfcbslip',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './tyfcbslip.component.html',
  styleUrls: ['./tyfcbslip.component.scss']
})
export class TyfcbslipComponent implements OnInit {
  activeTab: 'given' | 'received' = 'given';
  givenTyfcbs: TyfcbData[] = [];
  receivedTyfcbs: TyfcbData[] = [];
  isLoading = false;
  currentPage = 1;
  totalPages = 1;
  itemsPerPage = 10;
  showDetailModal = false;
  showTyfcbSlipModal = false;
  selectedTyfcb: TyfcbData | null = null;
  tyfcbSlipForm!: FormGroup;
  availableUsers: User[] = [];
  showMemberSelect = false;

  constructor(
    private tyfcbService: TyfcbService,
    private referralService: ReferralService,
    private fb: FormBuilder
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.loadActiveTabData();
  }

  private initializeForm(): void {
    this.tyfcbSlipForm = this.fb.group({
      receiverType: ['inChapter', Validators.required],
      receiverId: ['', Validators.required],
      amount: ['', [Validators.required, Validators.min(0)]],
      currency: ['INR', Validators.required],
      referral_type: ['Inside', Validators.required],
      business_type: ['New', Validators.required],
      comments: ['']
    });
  }

  switchTab(tab: 'given' | 'received'): void {
    this.activeTab = tab;
    this.currentPage = 1;
    this.loadActiveTabData();
  }

  async loadActiveTabData(): Promise<void> {
    this.isLoading = true;
    try {
      if (this.activeTab === 'given') {
        await this.loadGivenTyfcbs();
      } else {
        await this.loadReceivedTyfcbs();
      }
    } catch (error) {
      console.error('Error loading TYFCBs:', error);
    } finally {
      this.isLoading = false;
    }
  }

  async loadGivenTyfcbs(): Promise<void> {
    try {
      const response: TyfcbResponse = await this.tyfcbService.getTyfcbsByGiverId(this.currentPage, this.itemsPerPage);
      this.givenTyfcbs = Array.isArray(response.docs) ? response.docs : [];
      this.totalPages = response.totalPages || 1;
    } catch (error) {
      console.error('Error loading given TYFCBs:', error);
      this.givenTyfcbs = [];
    }
  }

  async loadReceivedTyfcbs(): Promise<void> {
    try {
      const response: TyfcbResponse = await this.tyfcbService.getTyfcbsByReceiverId(this.currentPage, this.itemsPerPage);
      this.receivedTyfcbs = Array.isArray(response.docs) ? response.docs : [];
      this.totalPages = response.totalPages || 1;
    } catch (error) {
      console.error('Error loading received TYFCBs:', error);
      this.receivedTyfcbs = [];
    }
  }

  get currentTyfcbs(): TyfcbData[] {
    return this.activeTab === 'given' ? this.givenTyfcbs : this.receivedTyfcbs;
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadActiveTabData();
    }
  }

  get paginationPages(): number[] {
    const pages: number[] = [];
    const start = Math.max(1, this.currentPage - 2);
    const end = Math.min(this.totalPages, this.currentPage + 2);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }

  openTyfcbSlip(): void {
    this.tyfcbSlipForm.reset();
    this.tyfcbSlipForm.patchValue({
      receiverType: 'inChapter',
      referral_type: 'Inside',
      business_type: 'New',
      amount: 0,
      currency: 'INR'
    });
    this.showMemberSelect = false;
    this.availableUsers = [];
    this.showTyfcbSlipModal = true;
    this.loadAvailableUsers();
  }

  async loadAvailableUsers(): Promise<void> {
    const receiverType = this.tyfcbSlipForm.get('receiverType')?.value;
    try {
      if (receiverType === 'inChapter') {
        const response = await this.referralService.getInsideUsers(1, 50);
        this.availableUsers = Array.isArray(response.data) ? response.data : [];
      } else if (receiverType === 'outside') {
        const response = await this.referralService.getOutsideUsers(1, 50);
        this.availableUsers = Array.isArray(response.docs) ? response.docs : [];
      }
    } catch (error) {
      console.error('Error loading users:', error);
      this.availableUsers = [];
    }
  }

  onReceiverTypeChange(event: any): void {
    const receiverType = event.target.value;
    this.tyfcbSlipForm.get('receiverId')?.reset('');
    this.showMemberSelect = true;
    this.loadAvailableUsers();
    if (receiverType === 'inChapter') {
      this.tyfcbSlipForm.get('referral_type')?.setValue('Inside');
    } else if (receiverType === 'outside') {
      this.tyfcbSlipForm.get('referral_type')?.setValue('Outside');
    }
  }

  async openDetailModal(tyfcbId: string): Promise<void> {
    try {
      const response: TyfcbResponse = await this.tyfcbService.getTyfcbById(tyfcbId);
      this.selectedTyfcb = Array.isArray(response) ? response[0] : response;
      console.log("Selected TYFCB:", this.selectedTyfcb);
      this.showDetailModal = true;
    } catch (error) {
      console.error('Error loading TYFCB detail:', error);
    }
  }

  closeDetailModal(): void {
    this.showDetailModal = false;
    this.selectedTyfcb = null;
  }

  closeTyfcbSlipModal(): void {
    this.showTyfcbSlipModal = false;
    this.availableUsers = [];
  }

  getReceiverName(tyfcb: TyfcbData): string {
    return tyfcb.receiverId?.name || 'Unknown';
  }

  async onSubmitTyfcbSlip(): Promise<void> {
    if (this.tyfcbSlipForm.invalid) {
      await swalHelper.showToast('Please fill all required fields correctly', 'error');
      return;
    }
    try {
      const formValue = this.tyfcbSlipForm.value;
      const tyfcbData: CreateTyfcbRequest = {
        receiverId: formValue.receiverId,
        amount: formValue.amount,
        currency: formValue.currency,
        referral_type: formValue.referral_type,
        business_type: formValue.business_type,
        comments: formValue.comments || ''
      };
      await this.tyfcbService.createTyfcb(tyfcbData);
      this.closeTyfcbSlipModal();
      await this.loadActiveTabData();
    } catch (error) {
      console.error('Error creating TYFCB:', error);
    }
  }
}