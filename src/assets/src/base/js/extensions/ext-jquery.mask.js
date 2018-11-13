$.jMaskGlobals.CPFCNPJMaskBehavior = function(val){
  let iscpf = val.replace(/\D/g, '').length <= 11;
  
  if(typeof(arguments[4])==='function')
    arguments[4](iscpf,arguments);
    
  if(iscpf)
    return '000.000.000-009';
    
  return '00.000.000/0000-00';
};

$.jMaskGlobals.SPMaskBehavior = function(val){
  let isSP = val.replace(/\D/g, '').length === 11;
  
  if(typeof(arguments[4])==='function')
    arguments[4](isSP,arguments);
    
  if(isSP)
    return '(00) 00000-0000';
    
  return '(00) 0000-00009';
};