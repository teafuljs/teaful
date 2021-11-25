import {useEffect} from 'react';
import Container from '@mui/material/Container';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import {CardActionArea} from '@mui/material';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';

import './App.css';

import {useStore} from './store';

function App() {
  const [images, setImages] = useStore.images();
  const [loading, setLoading] = useStore.loading();
  const [error, setError] = useStore.error();

  useEffect(() => {
    fetch('https://picsum.photos/v2/list')
        .then((response) => response.json())
        .then((images) => {
          setImages(images);
        })
        .catch((error) => {
          setError(error);
        })
        .finally(() => {
          setLoading(false);
        });
    // eslint-disable-next-line
  }, []);

  const LoadingView = (
    <Grid
      container
      spacing={0}
      direction="column"
      alignItems="center"
      justifyContent="center"
      style={{minHeight: '100vh'}}
    >
      <CircularProgress />
    </Grid>
  );
  const ErrorView = <>Something went wrong</>;
  const ListView = (
    <Grid
      container
      spacing={{xs: 2, md: 3}}
      columns={{xs: 4, sm: 8, md: 12}}
    >
      {images.slice(0, 12).map((data) => {
        const {author, downloadUrl, id} = data;
        return (
          <Grid item xs={2} sm={4} md={4} key={id}>
            <Card sx={{maxHeight: 345}}>
              <CardActionArea>
                <CardMedia
                  component="img"
                  height="140"
                  image={downloadUrl}
                  alt="green iguana"
                />
                <CardContent>
                  <Typography gutterBottom variant="h5" component="div">
                    {author}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        );
      })}
    </Grid>
  );
  /**
   * If loading is true show loader,
   * If error is true show Error
   * Otherwise show list
   */
  const ViewToShow = loading ? LoadingView : error ? ErrorView : ListView;
  return (
    <Container maxWidth="lg" sx={{mb: 4}}>
      <Stack spacing={2} direction="row" sx={{py: 4}}>
        <Button variant="contained" onClick={() => setLoading(!loading)}>
          Toggle Loading State
        </Button>
        <Button
          variant="contained"
          color="error"
          onClick={() => setError(!error)}
        >
          Toggle Error State
        </Button>
      </Stack>
      {ViewToShow}
    </Container>
  );
}

export default App;
