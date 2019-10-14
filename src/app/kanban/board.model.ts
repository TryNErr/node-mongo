export interface Board {
  id?: string;
  title?: string;
  priority?: number;
  tasks?: Task[];
}

export interface Task {
  description?: string;
  startdate?:string;
//  label?: 'purple' | 'blue' | 'green' | 'yellow' | 'red' | 'gray';
  label?:string;
}
