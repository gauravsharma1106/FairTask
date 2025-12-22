import React from 'react';
import { Card, Badge, Button } from '../components/ui';
import { Users, AlertOctagon, DollarSign } from 'lucide-react';

export const Admin: React.FC = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Admin Control Center</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-red-50 border-red-100">
            <div className="flex justify-between">
                <div>
                    <p className="text-xs text-red-500 font-bold uppercase">Fraud Attempts</p>
                    <h3 className="text-2xl font-extrabold text-gray-900">24</h3>
                </div>
                <AlertOctagon className="text-red-500" />
            </div>
        </Card>
        <Card className="p-4 bg-blue-50 border-blue-100">
             <div className="flex justify-between">
                <div>
                    <p className="text-xs text-blue-500 font-bold uppercase">Net Revenue</p>
                    <h3 className="text-2xl font-extrabold text-gray-900">$1,240</h3>
                </div>
                <DollarSign className="text-blue-500" />
            </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Pending Withdrawals</h3>
              <div className="space-y-3">
                  {[1,2,3].map(i => (
                      <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                          <div>
                              <p className="text-sm font-bold text-gray-900">User #{1000+i}</p>
                              <p className="text-xs text-gray-500">UPI: user@{i}</p>
                          </div>
                          <div className="text-right">
                              <p className="text-sm font-bold text-emerald-600">$50.00</p>
                              <div className="flex gap-2 mt-2">
                                  <button className="text-[10px] font-bold bg-emerald-100 text-emerald-600 px-3 py-1 rounded-md hover:bg-emerald-200">Approve</button>
                                  <button className="text-[10px] font-bold bg-red-100 text-red-600 px-3 py-1 rounded-md hover:bg-red-200">Reject</button>
                              </div>
                          </div>
                      </div>
                  ))}
              </div>
          </Card>

          <Card className="p-6">
               <h3 className="text-lg font-bold text-gray-900 mb-4">System Health</h3>
               <div className="space-y-4">
                   <div className="flex justify-between text-sm font-medium">
                       <span className="text-gray-500">Firebase Functions</span>
                       <Badge type="success">Operational</Badge>
                   </div>
                   <div className="flex justify-between text-sm font-medium">
                       <span className="text-gray-500">Payment Gateway</span>
                       <Badge type="success">Connected</Badge>
                   </div>
                   <div className="flex justify-between text-sm font-medium">
                       <span className="text-gray-500">App Check Enforced</span>
                       <Badge type="success">Active</Badge>
                   </div>
               </div>
               
               <div className="mt-8 pt-6 border-t border-gray-100">
                   <Button variant="danger" className="w-full mb-3 shadow-none">Emergency: Pause Withdrawals</Button>
                   <Button variant="outline" className="w-full">Download Audit Logs</Button>
               </div>
          </Card>
      </div>
    </div>
  );
};