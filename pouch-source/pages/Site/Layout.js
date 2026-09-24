import { Link } from 'react-router-dom'
import { Image } from "@mantine/core"
import pouchLogo from 'assets/images/logo.svg'

const Layout = (props) => {
    const handleDashboard = () => {
        window.location.href = `${
            process.env.REACT_APP_POUCH_WEB_URL || 'http://localhost:5173'
        }/signin`
    }

    return (
        <div style={{
            color: "#222",
            padding: "15vh 10vw",
            minHeight: "100vh",
            fontFamily: "Poppins",
        }}>

            <Link to='/'>
                <Image src={pouchLogo} width={30} style={{ position: "absolute", top: "20px", left: "40px"}} />
            </Link>
            <div style={{position: "absolute", top: "20px", right: "40px"}}>
                <Link to='#' onClick={handleDashboard}>Dashboard</Link>
            </div>
            
            {props.children}

            <div style={{marginTop: '48px', textAlign: 'center'}}>
                <Link to='/terms-of-service'>Terms of Service</Link>
                <span> &middot; </span>
                <Link to='/privacy-policy'>Privacy Policy</Link>
                <span> &middot; </span>
                <Link to='/product-disclosure-statement'>PDS</Link>
                <span> &middot; </span>
                <Link to='/support'>Support</Link>
            </div>
        </div>
    )
}

export default Layout
