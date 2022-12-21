export default { 

  RRStatus: [
      {
        name: 'Billing Error',
        background: '#F9DCD9',
        color: '#C00000'
      },
      {
        name: 'Coding Errors',
        background:'#F9DCD9',
        color: '#C00000'
      },
      {
        name: 'Lack of Documentation',
        background: '#C5E0B4',
        color: '#385724'
      },
      {
        name: 'Medical Necessity',
        background: '#C5E0B4',
        color: '#385724'
      },
      {
        name: 'Payor Error',
        background: '#C5E0B4',
        color: '#385724'
      },
    
    ],
    AUDIT_STATUS: [
      {
        name: 'Pending Recoupment',
        background:'#F9DCD9',
        color: '#C00000'
      },
      {
        name: 'Closed Finding Overturned',
        background: '#C5E0B4',
        color: '#385724'
      },
      {
        name: 'Closed No Finding',
        background: '#C5E0B4',
        color: '#385724'
      },
      {
        name: 'RAC/ADR/NN/CERT Received',
        background: '#FFFFCC',
        color: '#70AD47'
      },
      {
        name: 'Awaiting Compliance Review',
        background: '#FFFFCC',
        color: '#70AD47'
      },
      {
        name: 'HIMS Data Gathering & Investigation Underway',
        background: '#FFFFCC',
        color: '#70AD47'
      },
      {
        name: 'HIMS Medical Records Complete Ready For Compliance Review',
        background: '#FFFFCC',
        color: '#70AD47'
      },
      {
        name: 'Finding Under Investigation',
        background: '#FFFFCC',
        color: '#70AD47'
      },
      {
        name: 'Records Submitted',
        background: '#FFD966',
        color: '#843C0B'
      },
      {
        name: 'Appeal In Progress',
        background: '#FFD966',
        color: '#843C0B'
      },{
        name: 'Records Submitted',
        background: '#FFD966',
        color: '#843C0B'
      },{
        name: 'Appeal Submitted',
        background: '#FFD966',
        color: '#843C0B'
      },{
        name: 'Awaiting Auditor Review',
        background: '#FFD966',
        color: '#843C0B'
      },
      {
        name: 'Closed Audit Rescinded',
        background: '#D0CECE',
        color: '#000000'
      },
      {
        name: 'Compliance Review Complete Okay to SEND',
        background: '#00B050',
        color: '#000000'
      },
      {
        name: 'Closed Appeal Denied',
        background: '#C00000',
        color: '#FFC000'
      },
      {
        name: 'Closed Finding Accepted',
        background: '#C00000',
        color: '#FFC000'
      },{
        name: 'Closed Recoupment Complete',
        background: '#C00000',
        color: '#FFC000'
      },
    ],
    options: {
        'New': [
          {
            name: 'Fax Completed',
            value: 'Fax Completed',
            dropdown: true,
            filter: true
          },
          
          {
            name: 'Fax Correction Letter',
            value: 'Fax Correction Letter',
            dropdown: true,
            filter: true

          },
          {
            name: 'Billable New',
            value: 'Billable New',
            dropdown: true,
            filter: true
          },
          {
            name: 'Medical Forms New',
            value: 'Medical Forms New',
            dropdown: true,
            filter: true
          },
          {
            name: 'EMR To File',
            value: 'EMR To File',
            dropdown: true,
            filter: true
          },
          {
            name: 'Duplicate',
            value: 'Duplicate',
            dropdown: true,
            filter: true
          },
          
        ],
        'Billable New': [
          {
            name: 'Billable Completed',
            value: 'Billable Completed',
            dropdown: true,
            filter: true
          },

          {
            name: 'Billable Correction Letter',
            value:'Billable Correction Letter',
            dropdown: true,
            filter: true
          },
          {
            name: 'Not Billable',
            value: 'Not Billable',
            dropdown: true,
            filter: false
          },
          
          
        ],
        'Medical Forms New': [
          {
            name: 'Medical Forms Completed',
            value: 'Medical Forms Completed',
            dropdown: true,
            filter: true
          },
          {
            name:  'Not Billable',
            value: 'Not Billable',
            dropdown: true,
            filter: true
          }
          
        ],
        'Fax Completed': [
        
          {
            name: 'Not Completed',
            value: 'Not Completed',
            dropdown: true,
            filter: false
          },
          {
            name: 'Duplicate',
            value: 'Duplicate',
            dropdown: true,
            filter: true
          },
          {
            name: 'EMR To File',
            value: 'EMR To File',
            dropdown: true,
            filter: true
          }
        ],
        'EMR To File': [
          {
            name: 'Fax Completed',
            value: 'Fax Completed',
            dropdown: true,
            filter: true
          },
          {
            name: 'Not Completed',
            value: 'Not Completed',
            dropdown: true,
            filter: false
          },
          {
            name: 'Duplicate',
            value: 'Duplicate',
            dropdown: true,
            filter: true
          },
         
        ],
        'Fax Correction Letter': [
          {
            name: 'Fax Correction Letter',
            value: 'Fax Correction Letter',
            dropdown: true,
            filter: true
          },
          {
            name: 'Not Letter',
            value: 'Not Letter',
            dropdown: true,
            filter: false
          }
          
        ],
        'Billable Completed': [
          {
            name:  'Billiable correction Letter',
            value:  'Billiable correction Letter',
            dropdown: true,
            filter: true
          },
          {
            name:  'Billable Completed',
            value:  'Billable Completed',
            dropdown: true,
            filter: true
          },
       
          {
            name: 'Not Billable Completed',
            value: 'Not Billable Completed',
            dropdown: true,
            filter: true
          }
        ],
        'Billable Correction Letter': [
         
          {
            name: 'Billable Completed',
            value: 'Billable Completed',
            dropdown: true,
            filter: true
          },
          {
            name: 'Billable Correction Letter',
            value: 'Billable Correction Letter',
            dropdown: true,
            filter: true
          },
          {
            name: 'Not Billable Letter',
            value: 'Not Billable Letter',
            dropdown: true,
            filter: true
          }
        ],
        'Medical Forms New': [
        
          {
            name: 'Medical Forms Completed',
            value: 'Medical Forms Completed',
            dropdown: true,
            filter: true
          },
          {
            name: 'Medical Forms Correction Letter',
            value: 'Medical Forms Correction Letter',
            dropdown: true,
            filter: true
          },
          {
            name: 'Not Form',
            value: 'Not Form',
            dropdown: true,
            filter: false
          },
          
        ],
        'Medical Forms Completed': [
          {
            name: 'Not Forms Completed',
            value: 'Not Forms Completed',
            dropdown: true,
            filter: true
          },
          {
            name: 'Medical Forms Correction Letter',
            value: 'Medical Forms Correction Letter',
            dropdown: true,
            filter: true
          }
          
        ],
        'Medical Forms Correction Letter': [
          {
            name: 'Not Forms Completed',
            value: 'Not Forms Completed',
            dropdown: true,
            filter: true
          },
          {
            name: 'Medical Forms Completed',
            value: 'Medical Forms Completed',
            dropdown: true,
            filter: true
          }
    
        ],
        'other': [

          {
            name: 'Fax Completed',
            value: 'Fax Completed',
            dropdown: true,
            filter: true
          },
          {
            name: 'Fax Correction Letter',
            value: 'Fax Correction Letter',
            dropdown: true,
            filter: true
          },
          {
            name: 'Not Billable',
            value: 'Not Billable',
            dropdown: true,
            filter: true
          },
          {
            name: 'Billable New',
            value: 'Billable New',
            dropdown: true,
            filter: true
          },
          {
            name: 'Duplicate',
            value: 'Duplicate',
            dropdown: true,
            filter: true
          },
          {
            name: 'Billable Completed',
            value: 'Billable Completed',
            dropdown: true,
            filter: true
          },
          {
            name: 'Billable Correction letter',
            value: 'Billable Correction letter',
            dropdown: true,
            filter: true
          },
          {
            name: 'Medical Forms New',
            value: 'Medical Forms New',
            dropdown: true,
            filter: true
          },
          {
            name: 'Medical Forms Completed',
            value: 'Medical Forms Completed',
            dropdown: true,
            filter: true
          },
          {
            name: 'Medical Forms Correction Letter',
            value: 'Medical Forms Correction Letter',
            dropdown: true,
            filter: true
          },
    
        ]
    
    },
    folders: {
        'Fax Completed': 'faxtest/SmartApp Fax Completed',
        'EMR To File': 'faxtest/SmartApp Fax Completed',
        'Fax Correction Letter': 'faxtest/SmartApp Fax Correction Letter',
        'New': 'faxtest',
        'Billable New': 'faxtest/SmartApp Billable New',
        'Not Billable': 'faxtest',
        'Not Billable Completed': '/SmartApp Billable New',
        'Billable Correction Letter': 'faxtest/SmartApp Billable Correction Letter',
        'Not Letter': 'faxtest',
        'Billable Completed': 'faxtest/SmartApp Billable Completed',
        'Duplicate': 'faxtest/SmartApp Completed',
        'Medical Forms New': 'faxtest/SmartApp Medical Forms New',
        'Medical Forms Completed': 'faxtest/SmartApp Medical Forms Completed',
        'Not Forms Completed': 'faxtest/SmartApp Medical Forms New',
        'Medical Forms Correction Letter': 'faxtest/SmartApp Medical Forms Correction Letter'
      },
      foldersText: {
        'Fax Completed': '/SmartApp Fax Completed/',
        'EMR To File': '/SmartApp Fax Completed/',
        'Fax Correction Letter': '/SmartApp Fax Correction Letter/',
        'New': '/',
        'Billable New': '/SmartApp Billable New/',
        'Not Billable': '/',
        'Not Billable Completed': '/SmartApp Billable New/',
        'Billable Correction Letter': '/SmartApp Billable Correction Letter/',
        'Not Letter': '/',
        'Billable Completed': '/SmartApp Billable Completed/',
        'Duplicate': '/SmartApp Completed/',
        'Medical Forms New': '/SmartApp Medical Forms New/',
        'Medical Forms Completed': '/SmartApp Medical Forms Completed/',
        'Not Forms Completed': '/SmartApp Medical Forms New/',
        'Medical Forms Correction Letter': '/SmartApp Medical Forms Correction Letter/'
      },
      tabs: [
        {
          name: "New",
          value: "New"
        },
        {
          name: "Fax Completed",
          value: "Fax Completed"
        },
        {
          name: "Fax Correction Letter",
          value: "Fax Correction Letter"
        },
        {
          name: "SPACE",
          value: "SPACE"
        },
        {
          name: "Billable New",
          value: "Billable New"
        },
        {
          name: "Billable Completed",
          value: "Billable Completed"
        },
        {
          name: "Billable Correction Letter",
          value: "Billable Correction Letter"
        },
        {
          name: "SPACE",
          value: "SPACE"
        },
        {
          name: "Medical Forms New" ,
          value: "Medical Forms New" 
        },
        {
          name: "Medical Forms Completed" ,
          value: "Medical Forms Completed" 
        },
        {
          name: "Medical Forms Correction Letter" ,
          value: "Medical Forms Correction Letter" 
        }
       
      ]
    

}