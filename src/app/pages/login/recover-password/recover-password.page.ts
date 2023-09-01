import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ModalsService } from 'src/app/services/modals.service';

@Component({
  selector: 'app-recover-password',
  templateUrl: './recover-password.page.html',
  styleUrls: ['./recover-password.page.scss'],
})
export class RecoverPasswordPage implements OnInit {

  recoverForm: FormGroup;

  constructor(
    private router: Router,
    public formBuilder: FormBuilder,
    private modalService: ModalsService
  ) { }

  ngOnInit() {
    this.recoverForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.pattern('[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,3}$')]]
    })
  }

  goBack() {
    this.router.navigate(['/login'])
  }

  recover() {
    // alert(`Email: ${this.recoverForm.value.email}`)
    this.modalService.recoverPasswordDialog();
  }

}
