import { Task } from './task';

/**
 * This class contains a Quick Sort implementation applied to Emperor Tasks.
 *
 * It is a very lightly modified adaptation of https://www.softnami.com/posts_pr/algorithms-1quick-sort-using-typescript.html.
 *
 * Sorts in descending order.
 * 
 * @class TaskQuickSort
 * @constructor
 */
 export class TaskQuickSort {
  private arr: Task[];

  constructor() {}

  /**
   * Starts the sorting process.
   *
   * @method sort
   * @param {Array<Task>} array The Task array to be sorted.
   */
  public sort(array: Task[], ascending?: boolean): void {
    if (Array.isArray(array)) {
      if (array.length > 1) {
        this.arr = array;
        this.quicksort(0, this.arr.length - 1, ascending);
      }
    }
    else {
      throw new Error('invalid task array for sorting')
    }
  }

  /**
   * Swaps array according to given indices.
   *
   * @method swap
   * @param {Number} i Index of array to swap.
   * @param {Number} j Index of array to swap.
   */
  private swap(i: number, j: number): void {
    let temp: Task = this.arr[i];
    this.arr[i] = this.arr[j];
    this.arr[j] = temp;
  }

  /**
   * Sorts array in O(nlogn) time average case and O(n^2) worst case, with a space complexity of O(logn).
   *
   * @method quicksort
   * @param {Number} low The lower-end index of array.
   * @param {Number} high The higher-end index of array.
   */
  private quicksort(low: number, high: number, ascending?: boolean): void {
    let i: number = low;
    let j: number = high;
    let pivot: number = this.arr[Math.floor((low + high) / 2)].importance;

    if (ascending) {
      while (i <= j) {
        while (this.arr[i].importance < pivot) {
          i++;
        }
  
        while (this.arr[j].importance > pivot) {
          j--;
        }
  
        if (i <= j) {
          this.swap(i, j);
          i++;
          j--;
        }
      }
    }
    else {
      while (i <= j) {
        while (this.arr[i].importance > pivot) {
          i++;
        }
  
        while (this.arr[j].importance < pivot) {
          j--;
        }
  
        if (i <= j) {
          this.swap(i, j);
          i++;
          j--;
        }
      }
    }

    if (low < j) {
      this.quicksort(low, j);
    }
    if (i < high) {
      this.quicksort(i, high);
    }
  }
}
