import React, { useContext, useEffect, useCallback } from "react"
import { Switch, Redirect } from "react-router-dom"
import { withRouter, Route } from "react-router"
import { AuthStateContext, DispatchContext } from "./store"
import AuthRouter from "./auth/AuthRouter"
import routes from "./navigation/routes"
import firebase from 'firebase/app'
import Navbar from "./navbar/navbar"
import CustomizedSnackbar, { severity } from "./snackbar/CustomizedSnackbar"
import PageNotFound from "./pageNotFound"

function App (props) {
  
	const authState = useContext(AuthStateContext)
	const dispatch = useContext(DispatchContext)

	//Snackbar
	const openSnackbar = useCallback((severity, text) => {
		dispatch({ type: "openSnackBar", payload: { severity, text }})
	}, [dispatch])

	useEffect(() => { 
		const unsubscribe = firebase.auth().onAuthStateChanged((user) => {
			if (user) {
				dispatch({ type: "login", payload: user.email })
				props.history.push("/home")
				openSnackbar(severity.INFO, "Your IN motherfucker.")
			} 
		})
		return () => {
			unsubscribe()
		}
	}, [props.history, dispatch, openSnackbar])


	const closeSnackbar = () => {
		dispatch({ type: "closeSnackBar" })
	}
  
	const innerContent = (
		<div>
			<Route exact path={"/"} component={AuthRouter} />
			{ // If there is no auth state, disable all routes and redirect to login page.
				(authState?.authenticated !== false) ?
					<Switch>
						{routes.mainPages.map((page) => {
							const CurrentComponent = page.component
							return (
								<Route key={page.route[0]} path={page.route}>
									<Navbar />
									<CurrentComponent  />
								</Route>
							)
						})}
						<Route component={PageNotFound} />
					</Switch>: <Redirect to="/" />
			}
		</div>
	)
  
	return (
		<React.Fragment>
			{ innerContent }
			<CustomizedSnackbar  handleClose={() => closeSnackbar()} />
		</React.Fragment>
	)

}


export default withRouter(App)
