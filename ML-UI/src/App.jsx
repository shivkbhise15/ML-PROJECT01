import { BrowserRouter as Router,Routes,Route } from "react-router-dom"
import Home from "./pages/Home.jsx"
import Navbar from "./components/Navbar.jsx"
import Analytics from "./pages/Analytics";   
import Reports from "./pages/Reports"; 


function App() {
  return (
    <Router>
      <Navbar/>
      <Routes>
        <Route path="/" element={<Home/>}></Route>
         <Route path="/analytics" element={<Analytics />} />
        <Route path="/reports"   element={<Reports />} />
      </Routes>
   </Router>
    
  )
}

export default App
