// const nameEl = document.querySelector('#name')
// const emailEl = document.querySelector('#email')
// const phoneEl = document.querySelector('#mobile')
// const passwordEl = document.querySelector('#password')
// const confirmPasswordEl = document.querySelector('#confirmPassword')

// const form = document.querySelector('#signup')

// const checkUsername = () => {
//   let valid = false

//   const min = 3
//   const max = 25

//   const username = nameEl.value.trim()

//   if (!isRequired(username)) {
//     showError(nameEl, 'Username cannot be blank.')
//   } else if (!isBetween(username.length, min, max)) {
//     showError(nameEl, `Username must be between ${min} and ${max} characters.`)
//   } else {
//     showSuccess(nameEl)
//     valid = true
//   }
//   return valid
// }

// const checkEmail = () => {
//   let valid = false
//   const email = emailEl.value.trim()
//   if (!isRequired(email)) {
//     showError(emailEl, 'Email cannot be blank.')
//   } else if (!isEmailValid(email)) {
//     showError(emailEl, 'Email is not valid.')
//   } else {
//     showSuccess(emailEl)
//     valid = true
//   }
//   return valid
// }

// const checkMobile = () => {
//   let valid = false
//   const mobile = phoneEl.value.trim()
//   if (!isRequired(mobile)) {
//     showError(phoneEl, 'Phone number cannot be blank.')
//   } else if (!isMobileValid(mobile)) {
//     showError(phoneEl, 'Mobile is not valid.')
//   } else {
//     showSuccess(phoneEl)
//     valid = true
//   }
//   return valid
// }

// const checkPassword = () => {
//   let valid = false

//   const password = passwordEl.value.trim()

//   if (!isRequired(password)) {
//     showError(passwordEl, 'Password cannot be blank.')
//   } else if (!isPasswordSecure(password)) {
//     showError(passwordEl, 'Password must has at least 8 characters that include at least 1 lowercase character, 1 uppercase characters, 1 number, and 1 special character in (!@#$%^&*)')
//   } else {
//     showSuccess(passwordEl)
//     valid = true
//   }
//   return valid
// }

// const checkConfirmPassword = () => {
//   let valid = false
//   // check confirm password
//   const confirmPassword = confirmPasswordEl.value.trim()
//   const password = passwordEl.value.trim()

//   if (!isRequired(confirmPassword)) {
//     showError(confirmPasswordEl, 'Please enter the password again')
//   } else if (password !== confirmPassword) {
//     showError(confirmPasswordEl, 'The password does not match')
//   } else {
//     showSuccess(confirmPasswordEl)
//     valid = true
//   }

//   return valid
// }

// const isEmailValid = (email) => {
//   const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
//   return re.test(email)
// }
// const isMobileValid = (mobile) => {
//   const re = /^(?:\+91|0)?[7-9]\d{9}$/
//   return re.test(mobile)
// }

// const isPasswordSecure = (password) => {
//   const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
//   return re.test(password)
// }

// const isRequired = value => value !== ''
// const isBetween = (length, min, max) => !(length < min || length > max)

// const showError = (input, message) => {
//   // get the form-field element
//   const formField = input.parentElement
//   // add the error class
//   formField.classList.remove('success')
//   formField.classList.add('error')

//   // show the error message
//   const error = formField.querySelector('small')
//   error.textContent = message
// }

// const showSuccess = (input) => {
//   // get the form-field element
//   const formField = input.parentElement

//   // remove the error class
//   formField.classList.remove('error')
//   formField.classList.add('success')

//   // hide the error message
//   const error = formField.querySelector('small')
//   error.textContent = ''
// }

// form.addEventListener('submit', function (e) {
//   // prevent the form from submitting
//   e.preventDefault()

//   // validate fields
//   const isUsernameValid = checkUsername()
//   const isEmailValid = checkEmail()
//   const isMobileValid = checkMobile()
//   const isPasswordValid = checkPassword()
//   const isConfirmPasswordValid = checkConfirmPassword()

//   const isFormValid = isUsernameValid &&
//         isEmailValid && isMobileValid &&
//         isPasswordValid && isConfirmPasswordValid

//   // submit to the server if the form is valid
//   if (isFormValid) {
//     console.log('form is valid')
//     $.ajax({
//       type: 'POST',
//       url: '/userSignUp',
//       data: $('#signup').serialize(),
//       success: (response) => {
//         if (response.status) {
//           location.href = '/'
//         } else {
//           location.href = '/userSignUp'
//         }
//       }
//     })
//   }
// })

// const debounce = (fn, delay = 500) => {
//   let timeoutId
//   return (...args) => {
//     // cancel the previous timer
//     if (timeoutId) {
//       clearTimeout(timeoutId)
//     }
//     // setup a new timer
//     timeoutId = setTimeout(() => {
//       fn.apply(null, args)
//     }, delay)
//   }
// }

// form.addEventListener('input', debounce(function (e) {
//   switch (e.target.id) {
//     case 'name':
//       checkUsername()
//       break
//     case 'email':
//       checkEmail()
//       break
//     case 'mobile':
//       checkMobile()
//       break
//     case 'password':
//       checkPassword()
//       break
//     case 'confirmPassword':
//       checkConfirmPassword()
//       break
//   }
// }))

// const togglePassword = document.querySelector('#toggle-password')
// const passwordField = document.querySelector('#password')

// togglePassword.addEventListener('click', function (e) {
//   const type = passwordField.getAttribute('type') === 'password' ? 'text' : 'password'
//   passwordField.setAttribute('type', type)
//   this.querySelector('i').classList.toggle('fa-eye')
//   this.querySelector('i').classList.toggle('fa-eye-slash')
// })

// const toggleConfirmPassword = document.querySelector('#toggle-password2')
// const confirmPasswordField = document.querySelector('#confirmPassword')

// toggleConfirmPassword.addEventListener('click', function (e) {
//   const type = confirmPasswordField.getAttribute('type') === 'password' ? 'text' : 'password'
//   confirmPasswordField.setAttribute('type', type)
//   this.querySelector('i').classList.toggle('fa-eye')
//   this.querySelector('i').classList.toggle('fa-eye-slash')
// })