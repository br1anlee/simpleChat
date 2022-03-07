import { useNavigate } from 'react-router-dom';
import {
	Card,
	CardActions,
	CardHeader,
	TextField,
	Button,
	CardContent,
} from '@mui/material';
export default function CreateAccount() {
	const navigate = useNavigate();

	return (
		<main>
			<Card>
				<CardHeader title='Create Account' />
				<CardContent>
					<TextField placeholder='Username' />
					<TextField placeholder='Password' type='password' />
				</CardContent>
				<CardActions>
					<Button onClick={() => navigate('/', { replace: true })}>
						Already have an account? Click here.
					</Button>
				</CardActions>
			</Card>
		</main>
	);
}
