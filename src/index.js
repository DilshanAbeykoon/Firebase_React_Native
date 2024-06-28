import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Alert, Image, TextInput } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { firebase } from '../config';
import React, { useState, useEffect } from 'react';
import * as FileSystem from 'expo-file-system';

const UploadMediaFile = () => {
    const [image, setImage] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [imageName, setImageName] = useState('');

    useEffect(() => {
        (async () => {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== 'granted') {
                alert('Sorry, we need camera permissions to make this work!');
            }
        })();
    }, []);

    const takePhoto = async () => {
        let result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    const uploadMedia = async () => {
        if (!imageName.trim()) {
            Alert.alert('Please enter a name for the image.');
            return;
        }

        setUploading(true);

        try {
            const { uri } = await FileSystem.getInfoAsync(image);
            const blob = await new Promise((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                xhr.onload = () => {
                    resolve(xhr.response);
                };
                xhr.onerror = (e) => {
                    reject(new TypeError('Network request failed'));
                };
                xhr.responseType = 'blob';
                xhr.open('GET', uri, true);
                xhr.send(null);
            });

            const ref = firebase.storage().ref().child(imageName);

            await ref.put(blob);
            setUploading(false);
            Alert.alert('Photo Uploaded!!!');
            setImage(null);
            setImageName('');
        } catch (error) {
            console.error(error);
            setUploading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <TouchableOpacity style={styles.selectButton} onPress={takePhoto}>
                <Text style={styles.buttonText}>Take a Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.selectButton} onPress={pickImage}>
                <Text style={styles.buttonText}>Pick an Image</Text>
            </TouchableOpacity>
            <View style={styles.imageContainer}>
                {image && (
                    <>
                        <Image
                            source={{ uri: image }}
                            style={{ width: 300, height: 300 }}
                        />
                        <TextInput
                            style={styles.textInput}
                            placeholder="Enter image name"
                            placeholderTextColor="#999"
                            value={imageName}
                            onChangeText={setImageName}
                        />
                        <TouchableOpacity style={styles.uploadButton} onPress={uploadMedia}>
                            <Text style={styles.buttonText}>Upload Image</Text>
                        </TouchableOpacity>
                    </>
                )}
            </View>
        </SafeAreaView>
    );
};

export default UploadMediaFile;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
        alignItems: 'center',
        justifyContent: 'center',
    },
    selectButton: {
        borderRadius: 5,
        width: 150,
        height: 50,
        backgroundColor: 'blue',
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 10,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    uploadButton: {
        borderRadius: 5,
        width: 150,
        height: 50,
        backgroundColor: 'red',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10,
    },
    imageContainer: {
        marginTop: 30,
        marginBottom: 50,
        alignItems: 'center',
    },
    textInput: {
        borderColor: 'gray',
        borderWidth: 1,
        borderRadius: 5,
        padding: 10,
        width: 300,
        marginTop: 10,
        color: '#fff',
    },
});
