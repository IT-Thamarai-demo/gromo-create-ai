import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { jsPDF } from "https://esm.sh/jspdf@2.5.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    
    console.log('Exporting', messages.length, 'messages to PDF');

    const doc = new jsPDF();
    let yPosition = 20;

    doc.setFontSize(20);
    doc.text('Gromo GPT - Chat Export', 20, yPosition);
    yPosition += 15;

    doc.setFontSize(12);
    for (const message of messages) {
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
      }

      const role = message.role === 'user' ? 'You' : 'Gromo GPT';
      doc.setFont(undefined, 'bold');
      doc.text(role + ':', 20, yPosition);
      yPosition += 7;

      doc.setFont(undefined, 'normal');
      const lines = doc.splitTextToSize(message.content, 170);
      doc.text(lines, 20, yPosition);
      yPosition += (lines.length * 7) + 10;
    }

    const pdfBase64 = doc.output('datauristring').split(',')[1];

    console.log('PDF generated successfully');

    return new Response(
      JSON.stringify({ pdf: pdfBase64 }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in export-pdf function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
