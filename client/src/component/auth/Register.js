import React from 'react';
import { Fragment, useState } from 'react';
import {connect} from 'react-redux'
import {setAlert} from '../../actions/alert'
// import axios from 'axios'
import {Link} from 'react-router-dom'
//impt
import PropTypes from 'prop-types'


const Register = (props) => {

  const [ formData, setFormData ] = useState({
    name: '',
    email: '',
    password: '',
    password2: ''
  });

  const { name, email, password, password2 } = formData;

  // e.target.name will get name we provided for HTML element
  // It match our declared constants we want
  const onChange = e => setFormData({ ...formData, [e.target.name]:e.target.value});

  const onSubmit = async e =>{
      e.preventDefault();
      if(password !==password2)
        //console.log("Not match")
        props.setAlert('Password does not match', 'danger')
    else {
      console.log("Success")
    // Following code for sumiting data withour redux
    //   const newUser = {
    //     name,
    //     emial,
    //     password
    //   }
    //   const config = {
    //     headers : {
    //       'Content-Type': 'application/json'
    //     }
    //   }

    //   try {
    //     const body = JSON.stringify(newUser)
    //     const send = await axios.post('/api/users',body, config)
    //     console.log(send.data)
    //   } catch (err) {
    //     console.error(err.response.data)
    //   }
    }
  }
  
  return (
    <Fragment>
      <h1 className='large text-primary'>Sign Up</h1>
      <p className='lead'>
        <i className='fas fa-user'></i> Create Your Account
      </p>
      <form className='form' onSubmit={ e=> onSubmit(e)}>
        <div className='form-group'>
          {/* Here Call the setFormData Directly or using this shit */}
          <input
            type='text'
            placeholder='Name'
            name='name'
            value={name}
            onChange={e => onChange(e)}
            required
          />
        </div>
        <div className='form-group'>
          <input type='email' placeholder='Email Address' name='email' 
            value={email}
            onChange={e => onChange(e)} required/>
          <small className='form-text'>
            This site uses Gravatar so if you want a profile image, use a
            Gravatar email
          </small>
        </div>
        <div className='form-group'>
          <input
            type='password'
            placeholder='Password'
            name='password'
            value={password}
            onChange={e => onChange(e)}
            minLength='6'
          />
        </div>
        <div className='form-group'>
          <input
            type='password'
            placeholder='Confirm Password'
            name='password2'
            value={password2}
            onChange={e => onChange(e)}
            minLength='6'
          />
        </div>
        <input type='submit' className='btn btn-primary' value='Register' />
      </form>
      <p className='my-1'>
        Already have an account? <Link to='/login'>Sign In</Link>
      </p>
    </Fragment>
  );
};

Register.propTypes = {
  // ptfr
  setAlert: PropTypes.func.isRequired
}



//Takes 2 args: state to map
// To get state from alert/profile put it first param
// 2nd: Object with actions to use
// It allows accss props.setAlert
export default connect(null,{ setAlert} )(Register);
