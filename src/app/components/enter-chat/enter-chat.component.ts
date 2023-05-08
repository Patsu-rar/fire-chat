import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'enter-chat',
  templateUrl: './enter-chat.component.html',
  styleUrls: ['./enter-chat.component.scss'],
})
export class EnterChatComponent {
  userForm: FormGroup;
  @Output() nickname = new EventEmitter<string>();

  constructor(private formBuilder: FormBuilder) {
    this.userForm = this.formBuilder.group({
      nickname: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(15),
        ],
      ],
    });
  }

  onSubmit() {
    if (!this.userForm.valid) return;
    this.nickname.emit(this.userForm.controls['nickname'].value);
  }

  getFieldError(error = 'required', controlName = 'nickname') {
    return this.userForm.controls[controlName].hasError(error);
  }
}
