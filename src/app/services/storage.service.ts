import { Injectable } from '@angular/core';
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
  listAll
} from 'firebase/storage';
import { AuthService } from './auth.service';
import { firstValueFrom } from 'rxjs';
import { storage } from '../../../firebase.config';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  constructor(private readonly authService: AuthService) {}

  async uploadFile(file: File, path: string): Promise<string> {
    try {
      const currentUser = await firstValueFrom(this.authService.currentUser$);
      if (!currentUser) throw new Error('No user logged in');

      const timestamp = Date.now();
      const fileName = `${timestamp}_${file.name}`;
      const fullPath = `garages/${currentUser.garageId}/${path}/${fileName}`;

      const storageRef = ref(storage, fullPath);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);

      return downloadURL;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }

  async uploadMultipleFiles(files: File[], path: string): Promise<string[]> {
    const uploadPromises = files.map(file => this.uploadFile(file, path));
    return Promise.all(uploadPromises);
  }

  async deleteFile(url: string): Promise<void> {
    try {
      const fileRef = ref(storage, url);
      await deleteObject(fileRef);
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  }

  async getFilesByPath(path: string): Promise<string[]> {
    try {
      const currentUser = await firstValueFrom(this.authService.currentUser$);
      if (!currentUser) throw new Error('No user logged in');

      const fullPath = `garages/${currentUser.garageId}/${path}`;
      const storageRef = ref(storage, fullPath);
      const result = await listAll(storageRef);

      const urlPromises = result.items.map(item => getDownloadURL(item));
      return Promise.all(urlPromises);
    } catch (error) {
      console.error('Error getting files:', error);
      throw error;
    }
  }

  validateFile(file: File, maxSizeMB: number = 10, allowedTypes: string[] = []): boolean {
    // Check file size
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      throw new Error(`File size must be less than ${maxSizeMB}MB`);
    }

    // Check file type if specified
    if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
      throw new Error(`File type not allowed. Allowed types: ${allowedTypes.join(', ')}`);
    }

    return true;
  }

  getFileExtension(fileName: string): string {
    return fileName.split('.').pop()?.toLowerCase() || '';
  }

  isImageFile(file: File): boolean {
    return file.type.startsWith('image/');
  }

  isVideoFile(file: File): boolean {
    return file.type.startsWith('video/');
  }

  isPDFFile(file: File): boolean {
    return file.type === 'application/pdf';
  }
}