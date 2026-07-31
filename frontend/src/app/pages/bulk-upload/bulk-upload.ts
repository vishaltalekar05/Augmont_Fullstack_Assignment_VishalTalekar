import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BulkService } from '../../services/bulk.service';

@Component({
  selector: 'app-bulk-upload',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './bulk-upload.html',
  styleUrl: './bulk-upload.css'
})
export class BulkUpload {

  private bulkService = inject(BulkService);

  selectedFile: File | null = null;
  status = '';
  processed = 0;
  failed = 0;

  onFileSelect(event: any) {
    this.selectedFile = event.target.files[0];
  }

  upload() {

    if (!this.selectedFile) {
      alert("Select CSV File");
      return;
    }

    this.bulkService.upload(this.selectedFile)
      .subscribe((res: any) => {

        this.status = "Processing...";

        this.checkStatus(res.jobId);

      });

  }

  checkStatus(jobId: string) {

    const interval = setInterval(() => {

      this.bulkService.getStatus(jobId)
        .subscribe((res: any) => {

          this.status = res.status;
          this.processed = res.processed;
          this.failed = res.failed;

          if (res.status == "completed") {

            clearInterval(interval);

            alert("Bulk Upload Completed");

          }

        });

    }, 2000);

  }

}