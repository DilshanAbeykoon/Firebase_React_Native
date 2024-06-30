import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Alert, Image, TextInput, Dimensions } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { firebase } from '../config';
import * as FileSystem from 'expo-file-system';

const UploadWithAuth = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [image, setImage] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [imageName, setImageName] = useState('');
    const [loggedIn, setLoggedIn] = useState(false);

    useEffect(() => {
        (async () => {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== 'granted') {
                alert('Sorry, we need camera permissions to make this work!');
            }
        })();
    }, []);

    const handleLogin = async () => {
        try {
            await firebase.auth().signInWithEmailAndPassword(email, password);
            setLoggedIn(true);
            Alert.alert('Login Successful!');
            setEmail('');
            setPassword('');
        } catch (error) {
            Alert.alert('Login Error', error.message);
        }
    };

    const takePhoto = async () => {
        let result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [16, 9],
            quality: 1,
        });

        if (!result.cancelled) {
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

        if (!result.cancelled) {
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
            {!loggedIn ? (
                <View style={styles.authContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Email"
                        onChangeText={setEmail}
                        value={email}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Password"
                        secureTextEntry
                        onChangeText={setPassword}
                        value={password}
                    />
                    
                    <TouchableOpacity style={styles.button} onPress={handleLogin}>
                        <Text style={styles.buttonText}>Login</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <View style={styles.imageContainer}>
                    <TouchableOpacity style={styles.selectButton} onPress={takePhoto}>
                        <Text style={styles.buttonText}>Take a Photo</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.selectButton} onPress={pickImage}>
                        <Text style={styles.buttonText}>Pick an Image</Text>
                    </TouchableOpacity>

                    {image && (
                        <View style={styles.imagePreviewContainer}>
                            <Image
                                source={{ uri: image }}
                                style={styles.imagePreview}
                                resizeMode="contain"
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
                        </View>
                    )}
                </View>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
        alignItems: 'center',
        justifyContent: 'center',
    },
    authContainer: {
        width: '100%',
        alignItems: 'center',
        marginBottom: 20,
    },
    input: {
        width: '80%',
        padding: 15,
        marginBottom: 10,
        backgroundColor: '#333',
        color: '#fff',
        borderRadius: 8,
    },
    button: {
        width: '80%',
        padding: 15,
        backgroundColor: 'blue',
        alignItems: 'center',
        borderRadius: 8,
        marginTop: 10,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
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
    imagePreviewContainer: {
        alignItems: 'center',
        marginTop: 20,
    },
    imagePreview: {
        width: Dimensions.get('window').width - 40, // Use the full width of the screen with some padding
        height: Dimensions.get('window').height / 2, // Use half of the screen height for better visibility
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

export default UploadWithAuth;
