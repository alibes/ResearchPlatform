import { AgoraContext } from '../../context/ContextProvider';
import { useContext, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import { fetchData } from '../../helpers/axiosHelper';
import { loginScheme } from '../../schemes/loginScheme';

const initialValue = {
  email:'',
  password:''
}

export const LoginForm = () => {

  const {user, setUser, token, setToken} = useContext(AgoraContext);
  const navigate = useNavigate();
  
  const [login, setLogin] = useState(initialValue)
  const [valErrors, setValErrors] = useState({})
  const [msg, setMsg] = useState('')
  const [forgotpassword, setForgotpassword] = useState(false);


  const validateField = (name, value) => {
    try {
      loginScheme.pick({[name]: true}).parse({[name]:value});
      setValErrors({...valErrors, [name]:''})
    } catch (error) {
      setValErrors({...valErrors, [name]:error.errors[0].message})
    }
  }
  
  const handleChange = (e)=> {
    const {name, value} = e.target;
    setLogin({...login, [name]:value})

    validateField(name, value)
  } 

  const onSubmit = async (e) => {
    e.preventDefault()


     try {
      const tokenLocal = await fetchData('/login', 'post', login);
      
      const resultUser = await fetchData('/findUserById', 'get', null,  { Authorization: `Bearer ${tokenLocal}` });
      localStorage.setItem('agoraToken', tokenLocal)

      setToken(tokenLocal);
      
      if (resultUser[0]?.user_name){
        navigate('/profile');
      } else {
        navigate('/editprofile')
      }
      
    } catch (error) {
      setForgotpassword(true);
    }
  }


  return (
    <div className='formAppContainer'>
      <form className='formApp'>
        <p className='formTitle'>Log in</p>
        <div className='separatorThick' />
        <fieldset>
          <label htmlFor="email">Email</label>
          <input 
            id='email'
            type="email" 
            placeholder='Email'
            value={login.email}
            onChange={handleChange}
            name='email'
          />
        </fieldset>

        <fieldset>
          <label htmlFor="password">Password</label>
          <input 
            id='password'
            type="password" 
            placeholder='Password'
            value={login.password}
            onChange={handleChange}
            name='password'
          />
        </fieldset>

        <div className='separatorThick' />
        <p>Not registered? <Link to={'/register'} className="loginRegisterLink">REGISTER</Link></p>
        {forgotpassword &&
          <Link to={'/forgotPassword'} className="forgotPassword">Forgot your password?</Link>}
        <div className="errorMsg">
        {valErrors.email && <p>{valErrors.email}</p>}
        {valErrors.password && <p>{valErrors.password}</p>}
        <p>{msg}</p>
        </div>

        <div className='buttons'>
          <button 
            className="accept"
            onClick={onSubmit}
          >ACCEPT</button>
          <button 
            className="cancel"
            type='button'
            onClick={()=>navigate('/')}
          >CANCEL</button>
        </div>
      </form>
    </div>
  )
}
