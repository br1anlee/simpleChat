import { useState, useEffect } from 'react';
import {
	Avatar,
	Modal,
	Button,
	Card,
	CardHeader,
	CardContent,
	CardMedia,
	IconButton,
	Input,
	List,
	ListItem,
	ListItemAvatar,
	ListItemButton,
	ListItemText,
	CircularProgress,
} from '@mui/material';
import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded';
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';

import './design/postModal.css';

function CommentInput(props) {
	const { post, setHomeFeed, index } = props;

	const [comment, setComment] = useState('');

	const postComment = async (e, postId) => {
		e.preventDefault();

		const result = await fetch('/api/post/comment', {
			method: 'POST',
			headers: {
				'content-type': 'application/json',
			},
			body: JSON.stringify({ comment, postId }),
		});
		if (result.status === 200) {
			const { data } = await result.json();
			setComment('');
			setHomeFeed((prevState) => {
				data.owner = prevState[index].owner;
				prevState[index] = data;
				return [...prevState];
			});
			return;
		}
		return;
	};

	return (
		<form onSubmit={(e) => postComment(e, post._id)}>
			<Input
				disableUnderline
				endAdornment={<Button type='submit'>Comment</Button>}
				fullWidth
				placeholder='Comment'
				value={comment}
				onChange={(e) => setComment(e.target.value)}
			/>
		</form>
	);
}

export default function PostModal({
	postModalOpen,
	setPostModalOpen,
	post,
	setPostToView,
	loggedInUser,
}) {
	const controller = new AbortController();
	const signal = controller.signal;
	const handleClose = () => {
		setPostToView(null);
		setPostModalOpen(false);
	};

	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (postModalOpen) {
			fetch(`/api/post/?id=${post}`, {
				signal,
			})
				.then((res) => {
					if (res.status === 200) {
						return res.json();
					}
				})
				.then((result) => {
					console.log(result.post);
					setPostToView(result.post[0]);
					setLoading(false);
				});
		}
		return () => {
			controller.abort();
		};
	}, [postModalOpen]);

	if (loading) {
		return (
			<Modal id='postModal' open={postModalOpen} onClose={handleClose}>
				<CircularProgress />
			</Modal>
		);
	}
	if (!loading) {
		return (
			<Modal id='postModal' open={postModalOpen} onClose={handleClose}>
				<Card>
					{post?._id?.photo ? (
						<img
							alt='postImg'
							src={`${process.env.REACT_APP_S3_URL}${post?._id?.photo}`}
						/>
					) : null}
					<CardContent>
						<div>
							<Avatar
								src={`${process.env.REACT_APP_S3_URL}${loggedInUser.profilePhoto}`}
							/>
							{loggedInUser.username}
						</div>
						<List>
							{post?.postComments?.map((comment, index) => {
								return (
									<ListItem key={index}>
										<ListItemAvatar>
											<Avatar
												src={
													comment.owner.profilePhoto
														? `${process.env.REACT_APP_S3_URL}${comment.owner.profilePhoto}`
														: null
												}
											/>
										</ListItemAvatar>

										<div>
											<span>{comment.owner[0].username}</span>
											<span>
												{comment.comment}Lorem Ipsum is simply dummy text of the
												printing and typesetting industry. Lorem Ipsum has been
												the industry's standard dummy text ever since the 1500s,
												when an unknown printer took a galley of type and
												scrambled it to make a type specimen book.
											</span>
										</div>
									</ListItem>
								);
							})}
						</List>
						<div>
							{post?._id?.likes.includes(loggedInUser.username) ? (
								<IconButton disableRipple>
									<FavoriteRoundedIcon sx={{ color: 'red' }} />
								</IconButton>
							) : (
								<IconButton disableRipple>
									<FavoriteBorderRoundedIcon />
								</IconButton>
							)}
							<CommentInput />
						</div>
					</CardContent>
				</Card>
			</Modal>
		);
	}
}
