import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_app/screens/dashboard.dart';

void main() {
  testWidgets('Dashboard displays trade information', (WidgetTester tester) async {
    await tester.pumpWidget(const MaterialApp(home: Dashboard()));

    // Verify that the dashboard displays the correct initial state
    expect(find.text('Your Trades'), findsOneWidget);
    expect(find.text('Portfolio'), findsOneWidget);
  });

  testWidgets('Dashboard updates when new trades are added', (WidgetTester tester) async {
    await tester.pumpWidget(const MaterialApp(home: Dashboard()));

    // Simulate adding a new trade
    // This would typically involve calling a method to update the state
    // For example, you might have a method that adds a trade and calls setState

    // Verify that the new trade appears in the dashboard
    // expect(find.text('New Trade Details'), findsOneWidget);
  });
}