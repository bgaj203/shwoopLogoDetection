import React, {PureComponent} from 'react';
import {StyleSheet, Text, TouchableOpacity, View, Alert} from 'react-native';
import {RNCamera} from 'react-native-camera';
import config from './config.json';

const PendingView = () => (
  <View>
    <Text>Waiting</Text>
  </View>
);

class App extends PureComponent {
  state = {
    camera: false,
    cameraResult: false,
    result: null,
    visionResponse: '',
    loading: false,
    googleVisionDetetion: undefined,
  };

  render() {
    return (
      <View style={styles.container}>
        <Text style={{fontSize: 20}}> Logo Detection Test</Text>
        <RNCamera
          style={styles.preview}
          type={RNCamera.Constants.Type.back}
          flashMode={RNCamera.Constants.FlashMode.auto}
          captureAudio={false} //we do not need audio
          androidCameraPermissionOptions={{
            title: 'Permission to use camera',
            message: 'We need your permission to use your camera',
            buttonPositive: 'Ok',
            buttonNegative: 'Cancel',
          }}>
          {({camera, status}) => {
            if (status !== 'READY') return <PendingView />;
            return (
              <View
                style={{
                  flex: 0,
                  flexDirection: 'row',
                  justifyContent: 'center',
                }}>
                <TouchableOpacity
                  onPress={() => this.takePicture(camera)}
                  style={styles.capture}>
                  <Text style={{fontSize: 14}}> SNAP </Text>
                </TouchableOpacity>
              </View>
            );
          }}
        </RNCamera>
      </View>
    );
  }

  takePicture = async (value: any) => {
    if (value) {
      const options = {quality: 0.5, base64: true};
      const data = await value.takePictureAsync(options);
      // console.log(data);
      this.setState(
        {
          cameraResult: true,
          result: data.base64,
          camera: false,
        },
        () => this.callGoogleVIsionApi(this.state.result),
      );
      this.setState({loading: true});
      // console.log(this.state.result); //checking if the result state changes with the photo data
    }
  };

  callGoogleVIsionApi = async (base64: any) => {
    let googleVisionRes = await fetch(
      config.googleCloud.api + config.googleCloud.apiKey,
      {
        method: 'POST',
        body: JSON.stringify({
          requests: [
            {
              image: {
                content: base64,
              },
              features: [{type: 'LOGO_DETECTION', maxResults: 5}],
            },
          ],
        }),
      },
    );

    await googleVisionRes
      .json()
      .then(googleVisionRes => {
        // console.log(googleVisionRes); //console log the response
        if (googleVisionRes) {
          this.setState({
            loading: false,
            googleVisionDetetion: googleVisionRes.responses[0],
          });
          console.log('this.is response', this.state.googleVisionDetetion);
        }
      })
      .catch(error => {
        console.log(error);
      });
  };
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: 'black',
  },
  preview: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  capture: {
    flex: 0,
    backgroundColor: '#fff',
    borderRadius: 5,
    padding: 15,
    paddingHorizontal: 20,
    alignSelf: 'center',
    margin: 20,
  },
});

export default App;
